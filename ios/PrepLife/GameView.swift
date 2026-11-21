import SwiftUI
import WebKit
import UIKit

/// Hosts the bundled game (Resources/index.html) in a WKWebView.
/// Saves go to UserDefaults through the "store" message handler, so they survive
/// app updates and never depend on WebKit's file:// storage.
struct GameView: UIViewRepresentable {
    static let storeKey = "psl.nativeStore"

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let controller = WKUserContentController()
        let proxy = WeakMessageProxy(target: context.coordinator)
        controller.add(proxy, name: "store")
        controller.add(proxy, name: "haptic")

        // Hand the saved data to the page before any script runs.
        let saved = UserDefaults.standard.dictionary(forKey: Self.storeKey) as? [String: String] ?? [:]
        let json = (try? JSONSerialization.data(withJSONObject: saved)).flatMap { String(data: $0, encoding: .utf8) } ?? "{}"
        let bootstrap = WKUserScript(source: "window.__NATIVE_STORE = \(json); window.__NATIVE_APP = true;",
                                     injectionTime: .atDocumentStart, forMainFrameOnly: true)
        controller.addUserScript(bootstrap)

        let config = WKWebViewConfiguration()
        config.userContentController = controller
        config.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0x18 / 255, green: 0x23 / 255, blue: 0x3d / 255, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsLinkPreview = false
        webView.navigationDelegate = context.coordinator

        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    @MainActor final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        private let light = UIImpactFeedbackGenerator(style: .light)
        private let notify = UINotificationFeedbackGenerator()

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            switch message.name {
            case "store":
                guard let body = message.body as? [String: Any], let key = body["k"] as? String else { return }
                var saved = UserDefaults.standard.dictionary(forKey: GameView.storeKey) as? [String: String] ?? [:]
                if let value = body["v"] as? String { saved[key] = value } else { saved.removeValue(forKey: key) }
                UserDefaults.standard.set(saved, forKey: GameView.storeKey)
            case "haptic":
                switch message.body as? String {
                case "success": notify.notificationOccurred(.success)
                case "warning": notify.notificationOccurred(.warning)
                default: light.impactOccurred()
                }
            default:
                break
            }
        }

        // Open any outside link in Safari rather than inside the game.
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = navigationAction.request.url, url.scheme == "http" || url.scheme == "https",
               navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }
    }
}

/// Breaks the retain cycle between WKUserContentController and the coordinator.
@MainActor final class WeakMessageProxy: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?
    init(target: WKScriptMessageHandler) { self.target = target }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(controller, didReceive: message)
    }
}
