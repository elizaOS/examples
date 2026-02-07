import clsx from "clsx";
import { useEffect, useRef } from "react";
import { type LogEntry, useGameStore } from "../store/gameStore";

export function AdventureLog() {
	const { log, logVersion, dmTyping } = useGameStore();
	const bottomRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const userScrolledUp = useRef(false);

	const handleScroll = () => {
		const el = scrollContainerRef.current;
		if (!el) return;
		const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
		userScrolledUp.current = !atBottom;
	};

	useEffect(() => {
		if (logVersion === 0) return;
		if (!userScrolledUp.current) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [logVersion]);

	return (
		<div className="bg-slate-800/80 rounded-lg border border-slate-700 h-full flex flex-col">
			<div className="px-4 py-3 border-b border-slate-700">
				<h3 className="fantasy-heading text-lg text-gold-400">
					📜 Adventure Log
				</h3>
			</div>

			<div
				ref={scrollContainerRef}
				onScroll={handleScroll}
				className="flex-1 overflow-y-auto p-4 space-y-3"
			>
				{log.length === 0 ? (
					<div className="text-center text-slate-500 py-8">
						The adventure awaits...
					</div>
				) : (
					log.map((entry) => <LogEntryComponent key={entry.id} entry={entry} />)
				)}

				{/* DM typing indicator */}
				{dmTyping && (
					<div className="border-l-4 border-l-purple-500 bg-purple-900/20 rounded-r px-3 py-2 animate-pulse">
						<div className="flex items-center gap-2 text-xs text-slate-400">
							<span>📖</span>
							<span className="font-medium text-slate-300">Dungeon Master</span>
							<span className="italic">is composing a response...</span>
						</div>
					</div>
				)}

				<div ref={bottomRef} />
			</div>
		</div>
	);
}

function LogEntryComponent({ entry }: { entry: LogEntry }) {
	const typeStyles: Record<string, string> = {
		narrative: "border-l-purple-500 bg-purple-900/20",
		action: "border-l-blue-500 bg-blue-900/20",
		roll: "border-l-yellow-500 bg-yellow-900/20",
		combat: "border-l-red-500 bg-red-900/20",
		system: "border-l-slate-500 bg-slate-900/20",
		error: "border-l-orange-500 bg-orange-900/20",
	};

	const typeIcons: Record<string, string> = {
		narrative: "📖",
		action: "🎭",
		roll: "🎲",
		combat: "⚔️",
		system: "⚙️",
		error: "⚠️",
	};

	const formatTime = (date: Date) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div
			className={clsx("border-l-4 rounded-r px-3 py-2", typeStyles[entry.type])}
		>
			<div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
				<span>{typeIcons[entry.type]}</span>
				{entry.speaker && (
					<span className="font-medium text-slate-300">{entry.speaker}</span>
				)}
				<span className="ml-auto">{formatTime(entry.timestamp)}</span>
			</div>

			<div className="text-sm text-slate-200 whitespace-pre-wrap">
				{entry.content}
			</div>

			{/* Roll result display */}
			{!!entry.metadata?.roll && (
				<div className="mt-2 inline-flex items-center gap-2 bg-slate-800 rounded px-2 py-1">
					<span className="text-yellow-400">🎲</span>
					<span className="font-bold text-lg text-white">
						{(entry.metadata.roll as { total: number }).total}
					</span>
					<span className="text-xs text-slate-400">
						({(entry.metadata.roll as { type: string }).type})
					</span>
				</div>
			)}

			{/* Damage display */}
			{!!entry.metadata?.damage && (
				<div className="mt-2 inline-flex items-center gap-2 bg-red-900/50 rounded px-2 py-1">
					<span className="text-red-400">💥</span>
					<span className="font-bold text-red-300">
						{entry.metadata.damage as number} damage
					</span>
				</div>
			)}

			{/* Healing display */}
			{!!entry.metadata?.healing && (
				<div className="mt-2 inline-flex items-center gap-2 bg-green-900/50 rounded px-2 py-1">
					<span className="text-green-400">💚</span>
					<span className="font-bold text-green-300">
						{entry.metadata.healing as number} healed
					</span>
				</div>
			)}
		</div>
	);
}
