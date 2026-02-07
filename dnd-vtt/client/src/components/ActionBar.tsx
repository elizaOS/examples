import clsx from "clsx";
import { type FormEvent, useState } from "react";
import { useGameStore } from "../store/gameStore";

export function ActionBar() {
	const [message, setMessage] = useState("");
	const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
	const [showTargetPicker, setShowTargetPicker] = useState(false);
	const [pendingAction, setPendingAction] = useState<string | null>(null);
	const {
		sendMessage,
		sendAction,
		inCombat,
		connected,
		combatants,
		character,
	} = useGameStore();

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!message.trim() || !connected) return;

		sendMessage(message.trim());
		setMessage("");
	};

	/** Handle a quick action button press. Actions that need a target show the target picker. */
	const handleQuickAction = (action: string) => {
		const needsTarget = ["attack", "cast_spell", "help"].includes(action);

		if (needsTarget && inCombat) {
			// Show target picker
			setPendingAction(action);
			setShowTargetPicker(true);
			setSelectedTarget(null);
		} else {
			// Execute immediately (dodge, dash, disengage, end_turn, explore, etc.)
			sendAction(action);
			// Add optimistic local feedback
			const labels: Record<string, string> = {
				dodge: "takes the Dodge action",
				dash: "takes the Dash action",
				disengage: "takes the Disengage action",
				end_turn: "ends their turn",
				explore: "looks around carefully",
				investigate: "investigates the area",
				rest: "begins to rest",
				use_item: "reaches for an item",
			};
			if (character && labels[action]) {
				useGameStore.getState().addLogEntry({
					type: "action",
					speaker: character.name,
					content: `${character.name} ${labels[action]}.`,
				});
			}
		}
	};

	/** Confirm the targeted action with the selected target */
	const confirmTargetedAction = () => {
		if (!pendingAction || !selectedTarget) return;
		sendAction(pendingAction, { target: selectedTarget });

		// Local feedback
		const targetName =
			combatants.find((c) => c.id === selectedTarget)?.name ?? "target";
		if (character) {
			const actionLabel =
				pendingAction === "attack"
					? "attacks"
					: pendingAction === "cast_spell"
						? "casts a spell on"
						: "helps";
			useGameStore.getState().addLogEntry({
				type: "action",
				speaker: character.name,
				content: `${character.name} ${actionLabel} ${targetName}!`,
			});
		}

		setShowTargetPicker(false);
		setPendingAction(null);
		setSelectedTarget(null);
	};

	const cancelTargetPicker = () => {
		setShowTargetPicker(false);
		setPendingAction(null);
		setSelectedTarget(null);
	};

	// Determine valid targets for the pending action
	const validTargets = combatants.filter((c) => {
		if (!pendingAction) return false;
		if (pendingAction === "attack") {
			// Can attack enemies (monsters) that are alive
			return c.type === "monster" && c.hp.current > 0;
		}
		if (pendingAction === "cast_spell" || pendingAction === "help") {
			// Can target anyone alive
			return c.hp.current > 0;
		}
		return false;
	});

	const isSpectator = !character;

	const combatActions = [
		{ label: "Attack", action: "attack", icon: "⚔️" },
		{ label: "Cast Spell", action: "cast_spell", icon: "✨" },
		{ label: "Dash", action: "dash", icon: "💨" },
		{ label: "Dodge", action: "dodge", icon: "🛡️" },
		{ label: "Disengage", action: "disengage", icon: "🏃" },
		{ label: "Help", action: "help", icon: "🤝" },
		{ label: "Hide", action: "hide", icon: "🥷" },
		{ label: "End Turn", action: "end_turn", icon: "⏭️" },
	];

	const explorationActions = [
		{ label: "Look Around", action: "explore", icon: "👁️" },
		{ label: "Investigate", action: "investigate", icon: "🔍" },
		{
			label: "Short Rest",
			action: "rest",
			icon: "🛏️",
			meta: { restType: "short" },
		},
		{
			label: "Long Rest",
			action: "rest",
			icon: "⛺",
			meta: { restType: "long" },
		},
	];

	const quickActions = inCombat ? combatActions : explorationActions;

	return (
		<div className="bg-slate-800/80 rounded-lg border border-slate-700 p-3">
			{/* Target Picker Overlay */}
			{showTargetPicker && (
				<div className="mb-3 p-3 bg-slate-900 rounded border border-amber-500/50">
					<div className="text-sm text-amber-300 mb-2 font-medium">
						Choose a target for{" "}
						{pendingAction === "attack"
							? "Attack"
							: pendingAction === "cast_spell"
								? "Spell"
								: "Help"}
						:
					</div>
					<div className="flex flex-wrap gap-2 mb-2">
						{validTargets.map((target) => (
							<button
								type="button"
								key={target.id}
								onClick={() => setSelectedTarget(target.id)}
								className={clsx(
									"px-3 py-1.5 rounded text-sm font-medium transition-colors",
									selectedTarget === target.id
										? "bg-amber-600 text-white ring-2 ring-amber-400"
										: target.type === "monster"
											? "bg-red-900/40 text-red-300 hover:bg-red-900/60 border border-red-700"
											: "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 border border-blue-700",
								)}
							>
								{target.name}
								<span className="ml-1 text-xs opacity-70">
									({target.hp.current}/{target.hp.max} HP)
								</span>
							</button>
						))}
					</div>
					{validTargets.length === 0 && (
						<div className="text-sm text-slate-400 italic">
							No valid targets available.
						</div>
					)}
					<div className="flex gap-2 mt-2">
						<button
							type="button"
							onClick={confirmTargetedAction}
							disabled={!selectedTarget}
							className={clsx(
								"px-4 py-1.5 rounded text-sm font-medium transition-colors",
								selectedTarget
									? "bg-amber-600 hover:bg-amber-500 text-white"
									: "bg-slate-700 text-slate-500 cursor-not-allowed",
							)}
						>
							Confirm
						</button>
						<button
							type="button"
							onClick={cancelTargetPicker}
							className="px-4 py-1.5 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Quick Actions */}
			{!isSpectator && (
				<div className="flex gap-2 mb-3 overflow-x-auto pb-2">
					{quickActions.map(({ label, action, icon, ...rest }) => (
						<button
							type="button"
							key={action + label}
							onClick={() => {
								const meta = (rest as { meta?: Record<string, unknown> }).meta;
								if (meta) {
									sendAction(action, meta);
								} else {
									handleQuickAction(action);
								}
							}}
							disabled={!connected}
							className={clsx(
								"flex items-center gap-2 px-3 py-2 rounded font-medium text-sm whitespace-nowrap",
								"transition-colors",
								connected
									? "bg-slate-700 hover:bg-slate-600 text-slate-200"
									: "bg-slate-800 text-slate-500 cursor-not-allowed",
							)}
						>
							<span>{icon}</span>
							<span>{label}</span>
						</button>
					))}
				</div>
			)}

			{/* Spectator notice */}
			{isSpectator && (
				<div className="mb-3 text-center text-sm text-slate-400 italic">
					You are spectating. Join as a character to take actions.
				</div>
			)}

			{/* Message Input */}
			{!isSpectator && (
				<form onSubmit={handleSubmit} className="flex gap-2">
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder={
							inCombat ? "Describe your action..." : "What do you do?"
						}
						disabled={!connected}
						className={clsx(
							"flex-1 px-4 py-2 rounded bg-slate-900 border",
							"text-slate-200 placeholder-slate-500",
							"focus:outline-none focus:ring-2",
							connected
								? "border-slate-600 focus:border-gold-500 focus:ring-gold-500/30"
								: "border-slate-700 cursor-not-allowed",
						)}
					/>
					<button
						type="submit"
						disabled={!connected || !message.trim()}
						className={clsx(
							"px-6 py-2 rounded font-medium transition-colors",
							connected && message.trim()
								? "bg-gold-600 hover:bg-gold-500 text-white"
								: "bg-slate-700 text-slate-500 cursor-not-allowed",
						)}
					>
						Send
					</button>
				</form>
			)}

			{/* Connection Status */}
			{!connected && (
				<div className="mt-2 text-center text-sm text-red-400">
					Not connected to game server
				</div>
			)}
		</div>
	);
}
