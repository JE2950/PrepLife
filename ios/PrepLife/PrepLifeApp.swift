import SwiftUI

@main
struct PrepLifeApp: App {
    var body: some Scene {
        WindowGroup {
            GameView()
                .ignoresSafeArea()
                .background(Color(red: 0x18 / 255, green: 0x23 / 255, blue: 0x3d / 255))
                .preferredColorScheme(.dark)
                .statusBarHidden(false)
        }
    }
}
