import UIKit
import WebKit

/// Hosts a full-screen WKWebView that loads the production web app, seeds
/// deterministic state into localStorage before any app code runs, navigates to
/// a single target route, and waits until remote content has finished loading.
///
/// Configuration is passed via the process environment so the orchestration
/// script can drive one screen per launch without recompiling:
///
///   SHOT_BASE_URL     Origin to load, e.g. https://ramadan-companion.vercel.app
///   SHOT_ROUTE        Route + optional hash, e.g. "/times#qibla"
///   SHOT_SEED_JSON    JSON object of localStorage key/value strings to preset
///   SHOT_READY_JS     A JS boolean expression that resolves true when the
///                     screen's content has finished loading
///   SHOT_TIMEOUT      Max seconds to wait for readiness (default 40)
///   SHOT_SETTLE_MS    Extra settle delay after readiness, ms (default 1200)
///   SHOT_DONE_FILE    Absolute path; harness writes "ok"/"timeout" here when
///                     the screen is ready to capture
final class HarnessViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!
    private var readyDeadline: Date = .distantFuture
    private var pollTimer: Timer?

    private lazy var env = ProcessInfo.processInfo.environment

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()

        // Seed localStorage at document start, before the production React app
        // reads any of these keys. This is the sole determinism mechanism and
        // uses only keys the app already supports.
        if let seed = seedUserScript() {
            config.userContentController.addUserScript(seed)
        }

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        // Never show scroll indicators or a bounce edge in a captured frame.
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false
        webView.isOpaque = true
        view.addSubview(webView)

        let timeout = Double(env["SHOT_TIMEOUT"] ?? "") ?? 40
        readyDeadline = Date().addingTimeInterval(timeout)

        load()
    }

    private var baseURL: String {
        env["SHOT_BASE_URL"] ?? "https://ramadan-companion.vercel.app"
    }

    private var route: String {
        env["SHOT_ROUTE"] ?? "/"
    }

    private func load() {
        guard let url = URL(string: baseURL + route) else {
            finish(status: "bad-url")
            return
        }
        webView.load(URLRequest(url: url))
    }

    /// Build a document-start user script that writes the seed values into
    /// localStorage. The values arrive as a JSON object of strings.
    private func seedUserScript() -> WKUserScript? {
        guard let json = env["SHOT_SEED_JSON"], !json.isEmpty else { return nil }
        let js = """
        (function () {
          try {
            var seed = \(json);
            for (var k in seed) {
              if (Object.prototype.hasOwnProperty.call(seed, k)) {
                window.localStorage.setItem(k, String(seed[k]));
              }
            }
            // Fully suppress the PWA install banner: it is gated by a dismissal
            // timestamp within a 7-day window, so stamp "dismissed just now".
            window.localStorage.setItem('installPromptDismissed', 'true');
            window.localStorage.setItem('installPromptDismissedAt', String(Date.now()));
          } catch (e) { /* seeding is best-effort */ }
        })();
        """
        return WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }

    // MARK: - Navigation

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Content is client-rendered; begin polling the readiness expression.
        startPolling()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        finish(status: "nav-failed")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        finish(status: "nav-failed")
    }

    // MARK: - Readiness

    private func startPolling() {
        pollTimer?.invalidate()
        pollTimer = Timer.scheduledTimer(withTimeInterval: 0.4, repeats: true) { [weak self] _ in
            self?.checkReady()
        }
    }

    private func checkReady() {
        if Date() > readyDeadline {
            finish(status: "timeout")
            return
        }

        // Universal heuristic + per-screen expression: no spinners/skeletons
        // remain, and the screen-specific content signal is satisfied.
        let readyExpr = env["SHOT_READY_JS"] ?? "true"
        let js = """
        (function () {
          try {
            // Only primary loading spinners block capture. Secondary skeletons
            // (.animate-pulse) can persist on unrelated cards, so the
            // per-screen expression is the authoritative readiness signal.
            var spinners = document.querySelectorAll('.animate-spin').length;
            var screenReady = (function () { return (\(readyExpr)); })();
            return (spinners === 0) && !!screenReady;
          } catch (e) { return false; }
        })();
        """
        webView.evaluateJavaScript(js) { [weak self] result, _ in
            guard let self else { return }
            if (result as? Bool) == true {
                self.pollTimer?.invalidate()
                self.settleAndFinish()
            }
        }
    }

    /// Once ready, allow fonts/images/map tiles to paint, hide any transient
    /// focus rings, scroll to top-left for a stable frame, then signal done.
    private func settleAndFinish() {
        let settleMs = Double(env["SHOT_SETTLE_MS"] ?? "") ?? 1200
        let cleanup = """
        (function () {
          try {
            if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          } catch (e) {}
        })();
        """
        webView.evaluateJavaScript(cleanup, completionHandler: nil)
        DispatchQueue.main.asyncAfter(deadline: .now() + settleMs / 1000.0) { [weak self] in
            self?.finish(status: "ok")
        }
    }

    private var didFinish = false
    private func finish(status: String) {
        guard !didFinish else { return }
        didFinish = true
        pollTimer?.invalidate()
        if let path = env["SHOT_DONE_FILE"] {
            try? status.write(toFile: path, atomically: true, encoding: .utf8)
        }
    }
}
