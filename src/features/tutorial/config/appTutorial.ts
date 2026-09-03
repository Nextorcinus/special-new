import type {
	TutorialStep,
	TutorialStepConfig,
} from "../types";

export const TUTORIAL_STORAGE_KEY =
	"special-lazyness-tutorial-completed";

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
	{
		id: "home-quick-access",
		type: "info",
		title: "Welcome to Special Lazyness",
		description:
			"Let's take a quick tour. You can choose a calculator from Quick Access.",
		target:
			'[data-tutorial="home-quick-access"]',
		nextLabel: "Next",
		showSkip: true,
		allowNext: true,
		placement: "bottom",
	},
	{
		id: "chief-gear",
		type: "action",
		title: "Start with Chief Gear",
		description:
			"Start by opening Chief Gear from Quick Access.",
		target:
			'[data-tutorial="quick-access-chief-gear"]',
		showSkip: true,
		allowNext: false,
		placement: "bottom",
	},
	{
		id: "chief-gear-type",
		type: "info",
		title: "Select Your Current Gear",
		description:
			"Select the type of Chief Gear you currently have.",
		target:
			'[data-tutorial="chief-gear-type"]',
		showSkip: true,
		allowNext: false,
		placement: "top",
	},
	{
		id: "chief-gear-from",
		type: "info",
		title: "Select Your Current Level",
		description:
			"Select the current level of your Chief Gear.",
		target:
			'[data-tutorial="chief-gear-from"]',
		showSkip: true,
		allowNext: false,
		placement: "top",
	},
	{
		id: "chief-gear-target",
		type: "info",
		title: "Select Your Target Gear",
		description:
			"Now select the target Chief Gear level you want to upgrade to.",
		target:
			'[data-tutorial="chief-gear-target"]',
		nextLabel: "Next",
		showSkip: true,
		allowNext: true,
		placement: "top",
	},
	{
		id: "calculate",
		type: "action",
		title: "Calculate Your Upgrade",
		description:
			"Click Calculate to generate the resources required for your upgrade.",
		target:
			'[data-tutorial="chief-gear-calculate"]',
		showSkip: true,
		allowNext: false,
		placement: "top",
	},
	{
		id: "result",
		type: "info",
		title: "Your Calculation Result",
		description:
			"This is your calculation result. It shows the target items and the resources required for your upgrade.",
		target:
			'[data-tutorial="chief-gear-result"]',
		nextLabel: "Next",
		showSkip: true,
		allowNext: true,
		placement: "bottom",
	},
	{
		id: "bag-resources",
		type: "action",
		title: "Open Bag Resources",
		description:
			"Click Bag Resources below to enter the resources you currently have in the game.",
		target:
			'[data-tutorial="bag-resources"]',
		showSkip: true,
		allowNext: false,
		placement: "top",
	},
	{
		id: "bag-chief-gear",
		type: "action",
		title: "Chief Gear Resources",
		description:
			"The Chief Gear section is already selected. Enter the resources you currently have in your Bag, then press Save & Close when you're ready.",
		target:
			'[data-tutorial="bag-chief-gear"]',
		showSkip: true,
		allowNext: false,
		placement: "top",
	},
	{
		id: "bag-compare",
		type: "info",
		title: "Compare Your Resources",
		description:
			"Your resources have been saved. Here you can see how much of the required resources you currently have available.",
		target:
			'[data-tutorial="bag-compare-result"]',
		nextLabel: "Finish",
		showSkip: false,
		allowNext: true,
		placement: "bottom",
	},
];

export function getTutorialStep(
	step: TutorialStep,
): TutorialStepConfig | undefined {
	return TUTORIAL_STEPS.find(
		(item) => item.id === step,
	);
}

export function getTutorialStepIndex(
	step: TutorialStep,
): number {
	return TUTORIAL_STEPS.findIndex(
		(item) => item.id === step,
	);
}

export function getTutorialProgress(
	step: TutorialStep,
): {
	current: number;
	total: number;
} {
	const currentIndex =
		TUTORIAL_STEPS.findIndex(
			(item) => item.id === step,
		);

	return {
		current:
			currentIndex >= 0
				? currentIndex + 1
				: TUTORIAL_STEPS.length,
		total: TUTORIAL_STEPS.length,
	};
}