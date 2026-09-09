export type CalculationResource = {
	resourceId: string;
	amount: number;
};

export type CalculationResourceCheck = {
	resourceId: string;
	label: string;
	icon: string;
	required: number;
	available: number;
	sufficient: boolean;
	difference: number;
};

export type CalculationCompleteProps = {
	historyId: string;
	entryId: string;
	completed?: boolean;
	resources: CalculationResource[];
	from?: string;
	target?: string;
	onCompleted?: () => void;
};

export type CalculationCompleteStatusProps = {
	completed?: boolean;
	onClick?: () => void;
	disabled?: boolean;
};

export type CalculationCompleteDialogProps = {
	open: boolean;
	title?: string;
	subtitle?: string;
	from?: string;
	target?: string;
	resources: CalculationResourceCheck[];
	isCompleting?: boolean;
	hasEnoughResources: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

export type CalculationCompleteResourcesProps = {
	resources: CalculationResourceCheck[];
	showInventory?: boolean;
	showStatus?: boolean;
	className?: string;
};