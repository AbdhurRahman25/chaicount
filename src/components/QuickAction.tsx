type QuickActionProps = {
  label: string;
};

function QuickAction({ label }: QuickActionProps) {
  return (
    <button
      type="button"
      className="flex-1 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
    >
      + {label}
    </button>
  );
}

export default QuickAction;