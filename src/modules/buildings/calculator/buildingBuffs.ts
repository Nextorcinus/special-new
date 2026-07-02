export const PET_OPTIONS = [
	"Off",
	"Lv.1",
	"Lv.2",
	"Lv.3",
	"Lv.4",
	"Lv.5",
];

export const VP_OPTIONS = [
	"Off",
	"15%",
	"25%",
];

export const ZINMAN_OPTIONS = [
	"Off",
	"Lv.1",
	"Lv.2",
	"Lv.3",
	"Lv.4",
	"Lv.5",
];

export const VALERIA_OPTIONS = Array.from(
	{ length: 11 },
	(_, level) => ({
		value: level.toString(),
		label: `Lv.${level} (+${Math.min(level * 2, 20)}%)`,
	}),
);

export const AGNES_OPTIONS = [
	{
		value: "Off",
		label: "Off",
	},
	{
		value: "Lv.1",
		label: "Lv.1 (-2h)",
	},
	{
		value: "Lv.2",
		label: "Lv.2 (-3h)",
	},
	{
		value: "Lv.3",
		label: "Lv.3 (-4h)",
	},
	{
		value: "Lv.4",
		label: "Lv.4 (-6h)",
	},
	{
		value: "Lv.5",
		label: "Lv.5 (-8h)",
	},
];