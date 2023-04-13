import type {
  KeyedObject,
  Reference,
  SanityClient,
  SanityDocumentLike,
} from 'sanity'

export type Language = {
  id: Intl.UnicodeBCP47LocaleIdentifier
  title: string
}

export type SupportedLanguages =
  | Language[]
  | ((client: SanityClient) => Promise<Language[]>)

export type PluginConfig = {
  supportedLanguages: SupportedLanguages
  schemaTypes: string[]
  languageField?: string
  bulkPublish?: boolean
}

export type TranslationReference = KeyedObject & {
  _type: 'internationalizedArrayReferenceValue'
  value: Reference
}

export type Metadata = SanityDocumentLike & {
  translations: TranslationReference[]
}
