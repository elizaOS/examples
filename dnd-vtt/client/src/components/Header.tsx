import { useGameStore } from "../store/gameStore";

export function Header() {
	const {
		connected,
		phase,
		round,
		inCombat,
		character,
		campaignName,
		disconnect,
	} = useGameStore();

	const phaseLabels: Record<string, string> = {
		initializing: "Starting...",
		narration: "Story",
		exploration: "Exploration",
		social: "Conversation",
		combat: "Combat",
		rest: "Resting",
		transition: "Transition",
		ending: "Ending",
	};

	return (
		<header className="bg-slate-900/90 border-b border-slate-700 px-4 py-3">
			<div className="container mx-auto flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h1 className="font-fantasy text-2xl text-gold-400">
						D&D Virtual Tabletop
					</h1>

					{campaignName && (
						<span className="text-sm text-slate-400 hidden sm:inline">
							— {campaignName}
						</span>
					)}

					<div className="flex items-center gap-2 text-sm">
						<span
							className={`w-2 h-2 rounded-full ${
								connected ? "bg-green-500" : "bg-red-500"
							}`}
						/>
						<span className="text-slate-400">
							{connected ? "Connected" : "Disconnected"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-4">
					{/* Game Phase */}
					<div className="flex items-center gap-2">
						<span
							className={`px-2 py-1 rounded text-sm font-medium ${
								inCombat
									? "bg-red-900/50 text-red-300 border border-red-700"
									: "bg-slate-700 text-slate-300"
							}`}
						>
							{phaseLabels[phase] ?? phase}
							{inCombat && round > 0 && ` • Round ${round}`}
						</span>
					</div>

					{/* Character Info (compact) */}
					{character && (
						<div className="flex items-center gap-3 pl-4 border-l border-slate-700">
							<div className="text-right">
								<div className="text-sm font-medium text-slate-200">
									{character.name}
								</div>
								<div className="text-xs text-slate-400">
									Lv. {character.level} {character.race} {character.class}
								</div>
							</div>

							<div className="flex flex-col items-center">
								<div className="text-xs text-slate-500">HP</div>
								<div
									className={`text-sm font-bold ${
										character.hp.current <= character.hp.max * 0.25
											? "text-red-400"
											: character.hp.current <= character.hp.max * 0.5
												? "text-yellow-400"
												: "text-green-400"
									}`}
								>
									{character.hp.current}/{character.hp.max}
								</div>
							</div>

							<div className="flex flex-col items-center">
								<div className="text-xs text-slate-500">AC</div>
								<div className="text-sm font-bold text-slate-200">
									{character.ac}
								</div>
							</div>
						</div>
					)}

					{/* Leave button */}
					<button
						type="button"
						onClick={disconnect}
						className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-slate-800"
						title="Leave campaign"
					>
						Leave
					</button>
				</div>
			</div>
		</header>
	);
}
