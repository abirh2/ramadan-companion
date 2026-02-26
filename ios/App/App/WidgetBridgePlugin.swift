import Foundation
import Capacitor

/// Custom Capacitor plugin that reads/writes data to the shared App Group
/// UserDefaults container. This is the correct mechanism for sharing data
/// between the main app and widget extensions on iOS.
///
/// @capacitor/preferences uses UserDefaults.standard with a key prefix — it
/// does NOT write to the App Group container, so widgets cannot read that data.
/// This plugin fixes that by writing directly to UserDefaults(suiteName:).
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setValues", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getValue", returnType: CAPPluginReturnPromise),
    ]

    private static let appGroupId = "group.com.deencompanion.app"

    private var store: UserDefaults? {
        UserDefaults(suiteName: Self.appGroupId)
    }

    /// Write a batch of key-value pairs to the App Group UserDefaults.
    /// Expects: { data: { [key: string]: string } }
    @objc func setValues(_ call: CAPPluginCall) {
        guard let data = call.getObject("data") else {
            call.reject("Must provide data object")
            return
        }

        guard let store = self.store else {
            call.reject("App Group '\(Self.appGroupId)' is not accessible — check entitlements")
            return
        }

        for (key, value) in data {
            if let stringValue = value as? String {
                store.set(stringValue, forKey: key)
            }
        }

        call.resolve()
    }

    /// Read a single value from the App Group UserDefaults.
    /// Expects: { key: string }
    /// Returns: { value: string | null }
    @objc func getValue(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("Must provide a key")
            return
        }

        let value = store?.string(forKey: key)
        call.resolve(["value": value as Any])
    }
}
