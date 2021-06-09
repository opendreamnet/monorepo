export type RenderMediaOpts = {
  /**
   * Autoplay video/audio files.
   *
   * @default false
   */
  autoplay?: boolean
  /**
   * Mute video/audio files.
   *
   * @default false
   */
  muted?: boolean
  /**
   * Show video/audio player controls
   *
   * @default true
   */
  controls?: boolean
  /**
   * Files above this size will skip the "blob" strategy and fail.
   *
   * @default 200 * 1000 * 1000
   */
  maxBlobLength?: number
}