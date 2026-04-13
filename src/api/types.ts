export interface PresentationGenerationRequest {
  presentationTitle: string
  slidesLength: number
  additionalContext: string
  isDefaultTheme?: boolean
  generateSpeakerNotes?: boolean
}
