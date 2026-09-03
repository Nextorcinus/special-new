export type TutorialStep =
	| "home-quick-access"
	| "chief-gear"
	| "chief-gear-type"
	| "chief-gear-from"
	| "chief-gear-target"
	| "calculate"
	| "result"
	| "bag-resources"
	| "bag-chief-gear"
	| "bag-compare"
	| "complete";

export type TutorialStepType =
	| "info"
	| "action";

export interface TutorialStepConfig {
	id: TutorialStep;
	type: TutorialStepType;
	title: string;
	description: string;
	target?: string;
	nextLabel?: string;
	showSkip?: boolean;
	allowNext?: boolean;
	placement?:
		| "top"
		| "bottom"
		| "left"
		| "right"
		| "center";
}

export interface TutorialState {
	active: boolean;
	step: TutorialStep;
	completed: boolean;
}