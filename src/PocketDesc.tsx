export default function PocketDesc(
  { kind, address }: { address: string; kind: string },
) {
  return <div className="text-sm inline-block">
    <span
      className="p-1 rounded-l-lg shadow border-2 border-r-0 border-black font-bold bg-white text-black"
    >
      {kind}
    </span>
    <span
      className="bg-black text-white p-1.5 rounded-r-lg shadow border-1 border-black"
    >
      {address}
    </span>
  </div>;
}
