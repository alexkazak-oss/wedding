'use client'

import { SectionHeading } from '@/components/ui/section-heading'
import type { ContentBlock, MenuItem, TimelineItem } from '@/types'
import { useTranslations } from 'next-intl'

interface ContentEditorProps {
	contentBlocks: ContentBlock[]
	timelineItems: TimelineItem[]
	menuItems: MenuItem[]
}

export function ContentEditor({
	contentBlocks,
	timelineItems,
	menuItems,
}: ContentEditorProps) {
	const t = useTranslations('admin')

	return (
		<div className="space-y-10">
			<SectionHeading title={t('content')} className="text-left mb-6" />

			{/* Content Blocks */}
			<div className="space-y-6">
				<h3 className="font-serif text-lg text-ink">Content Blocks</h3>
				{contentBlocks.length === 0 ? (
					<EmptyState text="No content blocks yet. Add them via Supabase dashboard." />
				) : (
					<div className="space-y-4">
						{contentBlocks.map((block) => (
							<div
								key={block.id}
								className="bg-cream rounded-sm border border-border-light p-4"
							>
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs uppercase tracking-widest text-ink-muted font-sans">
										{block.section}
									</span>
									<span className="text-[10px] text-ink-muted/50 font-sans">
										{new Date(block.updated_at).toLocaleDateString()}
									</span>
								</div>
								<pre className="text-xs text-ink-light font-sans whitespace-pre-wrap">
									{JSON.stringify(block.content_ru, null, 2)}
								</pre>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Timeline */}
			<div className="space-y-6">
				<h3 className="font-serif text-lg text-ink">Timeline</h3>
				{timelineItems.length === 0 ? (
					<EmptyState text="No timeline items yet." />
				) : (
					<div className="bg-cream rounded-sm border border-border-light overflow-hidden">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border-light">
									<th className="text-left px-4 py-2 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal">
										Time
									</th>
									<th className="text-left px-4 py-2 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal">
										Title (RU)
									</th>
									<th className="text-left px-4 py-2 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal hidden sm:table-cell">
										Title (IT)
									</th>
								</tr>
							</thead>
							<tbody>
								{timelineItems.map((item) => (
									<tr key={item.id} className="border-b border-border-light last:border-0">
										<td className="px-4 py-2 text-sm font-sans text-ink">{item.time}</td>
										<td className="px-4 py-2 text-sm font-sans text-ink">{item.title_ru}</td>
										<td className="px-4 py-2 text-sm font-sans text-ink hidden sm:table-cell">
											{item.title_it}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Menu */}
			<div className="space-y-6">
				<h3 className="font-serif text-lg text-ink">Menu</h3>
				{menuItems.length === 0 ? (
					<EmptyState text="No menu items yet." />
				) : (
					<div className="bg-cream rounded-sm border border-border-light overflow-hidden">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border-light">
									<th className="text-left px-4 py-2 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal">
										Category
									</th>
									<th className="text-left px-4 py-2 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal">
										Item (RU)
									</th>
									<th className="text-left px-4 py-2 text-xs uppercase tracking-widest text-ink-muted font-sans font-normal hidden sm:table-cell">
										Item (IT)
									</th>
								</tr>
							</thead>
							<tbody>
								{menuItems.map((item) => (
									<tr key={item.id} className="border-b border-border-light last:border-0">
										<td className="px-4 py-2 text-sm font-sans text-ink-muted">{item.category_ru}</td>
										<td className="px-4 py-2 text-sm font-sans text-ink">{item.name_ru}</td>
										<td className="px-4 py-2 text-sm font-sans text-ink hidden sm:table-cell">
											{item.name_it}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}

function EmptyState({ text }: { text: string }) {
	return (
		<div className="bg-cream rounded-sm border border-border-light p-8 text-center">
			<p className="text-sm text-ink-muted font-sans">{text}</p>
		</div>
	)
}
