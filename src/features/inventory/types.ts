export type ResourceItem = {
	id: string;
	label: string;
	icon: string;
};

export type ResourceGroup = {
	id: string;
	title: string;
	items: ResourceItem[];
};

export type ExchangeConfig = {
	id: string;

	title: string;

	fromResourceId: string;
	toResourceId: string;

	fromLabel: string;
	toLabel: string;

	fromIcon: string;
	toIcon: string;

	ratio: number;
};
