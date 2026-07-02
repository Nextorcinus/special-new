export type ResourceItem = {
	id: string;
	label: string;
	icon: string;
	value: string;
};

export type ResourceGroup = {
	id: string;
	title: string;
	items: ResourceItem[];
};
