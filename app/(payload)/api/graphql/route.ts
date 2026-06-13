import config from '@payload-config'
import { GRAPHQL_POST } from '@payloadcms/next/routes'

import { importMap } from '../../importMap.js'

// @ts-expect-error — importMap signature differs slightly between minor versions
export const POST = GRAPHQL_POST({ config, importMap })
