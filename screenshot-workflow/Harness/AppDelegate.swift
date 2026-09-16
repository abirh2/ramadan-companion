import UIKit

// Entry point for the standalone screenshot harness app.
//
// This app is NOT part of the shipping Deen Companion product. It exists only
// to render the production web app (https://ramadan-companion.vercel.app) inside
// a WKWebView on an iOS simulator so that `xcrun simctl io screenshot` can
// capture clean, deterministic App Store screenshots.
//
// Determinism is achieved entirely through data the production app already reads
// (localStorage keys such as location_*, calculation_method, madhab, and the
// next-themes storage key). Nothing here changes production behaviour.
@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = HarnessViewController()
        window.makeKeyAndVisible()
        self.window = window
        return true
    }
}
