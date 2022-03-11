import { AuthorKeypair } from "earthstar";
import { IdentityLabel, useIdentity } from "react-earthstar";
import CopyButton from "./CopyButton";

export default function IdentityCard({ keypair }: { keypair: AuthorKeypair }) {
	const [currentIdentity, setCurrentIdentity] = useIdentity()

	return (
		<div className="bg-blue-50 border-2 border-blue-200 shadow p-3 rounded-lg space-y-3 max-w-prose">
			<div className="flex items-baseline justify-between"><IdentityLabel className="text-2xl font-bold font-mono" address={keypair.address} />
				{
					currentIdentity?.address === keypair.address ? <button className="text-red-500 border border-red-500 text-sm p-1 rounded" onClick={() => {
						const isSure = window.confirm('Are you sure you want to sign out? These credentials will be forgotten.');

						if (isSure) {
							setCurrentIdentity(null)
						}
					}}>Sign out</button> : null
				}
			</div>
			<hr className="border-gray-400" />
			<div className="space-y-1">
				<div className="flex items-baseline space-x-2">
					<div className="font-bold">Address</div>
					<div className="px-2 overflow-hidden text-ellipsis font-mono text-sm">
						{keypair.address}
					</div>

					<CopyButton
						className="p-1 text-sm text-blue-500 border border-blue-500 rounded whitespace-nowrap"
						copyValue={keypair.address}
					>
						Copy
					</CopyButton>

				</div>
				<div className="flex items-baseline space-x-2">
					<div className="font-bold">Secret</div>
					<input
						className="bg-transparent flex-grow"
						type="password"
						readOnly
						value={keypair.secret}
					/>
					<CopyButton
						className="p-1 text-sm text-blue-500 border border-blue-500 rounded whitespace-nowrap"
						copyValue={keypair.address}
					>
						Copy
					</CopyButton>

				</div>
			</div>
		</div>
	);
}