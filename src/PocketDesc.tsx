export default function PocketDesc(
  { address }: { address: string },
) {
  return (
    <div className="text-sm inline-block">
      <span className="bg-black text-white p-1.5 rounded-r-lg shadow border-1 border-black">
        {address}
      </span>
    </div>
  );
}
