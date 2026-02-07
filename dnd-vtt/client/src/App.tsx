import { useEffect } from "react";
import { ActionBar } from "./components/ActionBar";
import { AdventureLog } from "./components/AdventureLog";
import { BattleMap } from "./components/BattleMap";
import { CharacterPanel } from "./components/CharacterPanel";
import { Header } from "./components/Header";
import { InitiativeTracker } from "./components/InitiativeTracker";
import { JoinScreen } from "./components/JoinScreen";
import { useGameStore } from "./store/gameStore";

function App() {
	const { connect, joined, inCombat } = useGameStore();

	useEffect(() => {
		connect();
	}, [connect]);

	if (!joined) return <JoinScreen />;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			<Header />
			<div className="container mx-auto p-4">
				<div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
					<div className="col-span-3 flex flex-col gap-4">
						<CharacterPanel />
						{inCombat && <InitiativeTracker />}
					</div>
					{inCombat ? (
						<>
							<div className="col-span-6 flex flex-col gap-4">
								<div className="flex-1 rounded-lg overflow-hidden border border-slate-700 bg-slate-800/50">
									<BattleMap />
								</div>
								<ActionBar />
							</div>
							<div className="col-span-3">
								<AdventureLog />
							</div>
						</>
					) : (
						<div className="col-span-9 flex flex-col gap-4">
							<AdventureLog />
							<ActionBar />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default App;
