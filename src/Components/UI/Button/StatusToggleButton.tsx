const StatusToggleButton = ({ active, onClick, disabled }: { active: boolean; onClick: () => void; disabled: boolean }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        cursor-pointer
        w-full p-3
        rounded-xl
        font-semibold
        transition-all
        transform
        active:scale-95
        border
        ${
          active
            ? 'text-green-600 border-gray-300 bg-green-100 hover:bg-green-200'
            : 'text-red-600 border-gray-300 bg-red-100 hover:bg-red-200'
        }
      `}
      disabled={disabled}
    >
      {active ? 'Active' : 'Inactive'}
    </button>
  );
};

export default StatusToggleButton;