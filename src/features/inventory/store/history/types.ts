export type CalculationModule =
	| "buildings"
	| "gear"
	| "charm"
	| "research"
	| "war-academy"
	| "unlock-t12"
	| "skill-t12"
	| "widget"
	| "pet"
	| "troops"
	| "experts";

/**
 * One individual calculation inside a History.
 *
 * Example:
 *
 * History: Chief Gear Plan
 *
 * items:
 * ├── Pants
 * │   ├── completed: true
 * │   └── completedAt: ...
 * │
 * └── Belt
 *     ├── completed: false
 *     └── completedAt: undefined
 */
export type CalculationHistoryEntry<TForm = any, TResult = any> = {
	/**
	 * Unique ID for this individual calculation.
	 *
	 * This MUST be different from the parent History ID.
	 */
	id: string;

	/**
	 * Display title of this calculation.
	 *
	 * Example:
	 * Pants
	 * Belt
	 * Coat
	 */
	title: string;

	/**
	 * Optional display subtitle.
	 *
	 * Example:
	 * Blue → Purple
	 * Red ★ → 1/4 → Red ★★ → 2/4
	 */
	subtitle?: string;

	/**
	 * Form state used to create this calculation.
	 */
	form: TForm;

	/**
	 * Calculation result.
	 */
	result: TResult;

	/**
	 * When this individual calculation was created.
	 */
	createdAt: string;

	/**
	 * Whether this individual calculation
	 * has been completed by the user.
	 *
	 * Old History data may not contain this field,
	 * therefore it remains optional.
	 */
	completed?: boolean;

	/**
	 * When this individual calculation
	 * was marked as completed.
	 */
	completedAt?: string;
};

/**
 * Parent History item.
 *
 * One History can contain one or multiple
 * individual calculation entries.
 *
 * Example:
 *
 * History
 * ├── Pants
 * ├── Belt
 * ├── Coat
 * └── Boots
 */
export type CalculationHistoryItem<TForm = any, TResult = any> = {
	/**
	 * Unique ID for the entire History.
	 */
	id: string;

	/**
	 * Calculator module that owns this History.
	 */
	module: CalculationModule;

	/**
	 * Optional category inside the module.
	 */
	category?: string;

	/**
	 * History title.
	 *
	 * Example:
	 * Chief Gear Upgrade Plan
	 */
	title: string;

	/**
	 * Optional History subtitle.
	 *
	 * Example:
	 * 4 Items
	 */
	subtitle?: string;

	/**
	 * Form state of the latest/current calculation.
	 *
	 * This is kept for compatibility with the existing
	 * History system and for loading the form again.
	 */
	form: TForm;

	/**
	 * Result of the latest/current calculation.
	 *
	 * This is kept for compatibility with the existing
	 * History system.
	 */
	result: TResult;

	/**
	 * Individual calculation results belonging
	 * to this History.
	 *
	 * Each entry has its own completed state.
	 */
	items?: CalculationHistoryEntry<TForm, TResult>[];

	/**
	 * Whether the entire History is pinned.
	 *
	 * This is NOT the completion state.
	 */
	isPinned?: boolean;

	/**
	 * When the History was first created.
	 */
	createdAt: string;

	/**
	 * When the History was last modified.
	 *
	 * This can change when:
	 *
	 * - calculation is updated
	 * - item is added
	 * - item is completed
	 * - History is renamed
	 * - History is pinned/unpinned
	 */
	updatedAt?: string;
};
