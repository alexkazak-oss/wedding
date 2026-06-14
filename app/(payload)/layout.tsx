import config from '@payload-config'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'

/* Стандартный глобальный стиль Payload admin (~306 KB): layout, nav, login, темы.
   Без него админка рендерится без стилей (белый экран). */
import '@payloadcms/next/css'

type Args = {
	children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
	'use server'
	return handleServerFunctions({
		...args,
		config,
		importMap,
	})
}

const Layout = ({ children }: Args) => (
	<RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
		{children}
	</RootLayout>
)

export default Layout
