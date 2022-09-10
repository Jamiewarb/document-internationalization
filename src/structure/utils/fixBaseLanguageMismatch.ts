import type {SanityDocument} from '@sanity/client'
import {getBaseLanguage, getConfig, getLanguagesFromOption, getSanityClient} from '../../utils'

export const fixBaseLanguageMismatch = async (
  schema: string,
  basedocuments: SanityDocument[]
): Promise<void> => {
  const sanityClient = getSanityClient()
  const config = getConfig(schema)
  const languages = await getLanguagesFromOption(config.languages)
  const baseLanguage = getBaseLanguage(languages, config.base)
  const langFieldName = config.fieldNames.lang
  const transaction = sanityClient.transaction()
  basedocuments.forEach((doc) => {
    if (doc[langFieldName] !== baseLanguage?.id) {
      transaction.patch(doc._id, {
        set: {[langFieldName]: baseLanguage?.id}, // eslint-disable-line
      })
    }
  })
  await transaction.commit()
}
