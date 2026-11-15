import AVFoundation
import ExpoModulesCore

// Playback-only sound effects. This module deliberately contains no recording or
// microphone code, so the app never needs a microphone permission.
public class KidsSoundModule: Module {
  private var players: [String: AVAudioPlayer] = [:]

  public func definition() -> ModuleDefinition {
    Name("KidsSound")

    OnCreate {
      // Ambient: respects the silent switch and lets other audio keep playing.
      try? AVAudioSession.sharedInstance().setCategory(.ambient, options: [.mixWithOthers])
    }

    AsyncFunction("load") { (name: String, uri: String) in
      guard let url = URL(string: uri) else {
        return
      }
      let player = try AVAudioPlayer(contentsOf: url)
      player.prepareToPlay()
      self.players[name] = player
    }
    .runOnQueue(.main)

    AsyncFunction("play") { (name: String) in
      guard let player = self.players[name] else {
        return
      }
      player.currentTime = 0
      player.play()
    }
    .runOnQueue(.main)
  }
}
