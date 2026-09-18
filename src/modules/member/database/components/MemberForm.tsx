"use client";

import { useEffect, useState } from "react";
import { Save, UserRound, X } from "lucide-react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";

import type {
	Member,
	MemberFormValues,
} from "../types/member.types";

type MemberFormProps = {
	member?: Member | null;
	loading?: boolean;
	onSubmit: (values: MemberFormValues) => Promise<void>;
	onCancel: () => void;
};

export default function MemberForm({
	member,
	loading = false,
	onSubmit,
	onCancel,
}: MemberFormProps) {
	const [name, setName] = useState("");
	const [furnace, setFurnace] = useState("");
	const [power, setPower] = useState("");

	const [error, setError] = useState("");

	useEffect(() => {
		if (member) {
			setName(member.name);
			setFurnace(String(member.furnace));
			setPower(member.power ?? "");
		} else {
			setName("");
			setFurnace("");
			setPower("");
		}

		setError("");
	}, [member]);

	async function handleSubmit(
		event: React.FormEvent<HTMLFormElement>,
	) {
		event.preventDefault();

		const trimmedName = name.trim();
		const trimmedFurnace = furnace.trim();
		const trimmedPower = power.trim();

		if (!trimmedName) {
			setError("Member name is required.");
			return;
		}

		const furnaceNumber = Number(trimmedFurnace);

		if (
			!Number.isInteger(furnaceNumber) ||
			furnaceNumber < 1
		) {
			setError("Enter a valid Furnace level.");
			return;
		}

		setError("");

		await onSubmit({
			name: trimmedName,
			furnace: trimmedFurnace,
			power: trimmedPower,
		});
	}

	const isEditing = Boolean(member);

	return (
		<div className="w-full">
			<div className="mb-5 flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]">
						<UserRound className="size-5" />
					</div>

					<div>
						<h2 className="text-base font-bold text-[var(--sl-text)]">
							{isEditing
								? "Edit Member"
								: "Add Member"}
						</h2>

						<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
							{isEditing
								? "Update the member's global information."
								: "Add a member to your global database."}
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={onCancel}
					disabled={loading}
					aria-label="Close"
					className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)] disabled:pointer-events-none disabled:opacity-50"
				>
					<X className="size-4" />
				</button>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-4"
			>
				<div className="space-y-2">
					<label
						htmlFor="member-name"
						className="text-xs font-bold text-[var(--sl-text)]"
					>
						Name
					</label>

					<SLInput
						id="member-name"
						value={name}
						onChange={(event) =>
							setName(event.target.value)
						}
						placeholder="e.g. Special One"
						autoComplete="off"
						disabled={loading}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<label
							htmlFor="member-furnace"
							className="text-xs font-bold text-[var(--sl-text)]"
						>
							Furnace
						</label>

						<SLInput
							id="member-furnace"
							type="number"
							min={1}
							value={furnace}
							onChange={(event) =>
								setFurnace(
									event.target.value,
								)
							}
							placeholder="10"
							disabled={loading}
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="member-power"
							className="text-xs font-bold text-[var(--sl-text)]"
						>
							Power
						</label>

						<SLInput
							id="member-power"
							value={power}
							onChange={(event) =>
								setPower(
									event.target.value,
								)
							}
							placeholder="912M"
							autoComplete="off"
							disabled={loading}
						/>

						<p className="text-[10px] leading-4 text-[var(--sl-text-muted)]">
							Examples: 912M, 8.731B
						</p>
					</div>
				</div>

				{error && (
					<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-400">
						{error}
					</div>
				)}

				<div className="flex justify-end gap-2 pt-2">
					<SLButton
						type="button"
						variantType="secondary"
						onClick={onCancel}
						disabled={loading}
					>
						Cancel
					</SLButton>

					<SLButton
						type="submit"
						disabled={loading}
						className="min-w-28"
					>
						<Save className="mr-2 size-4" />

						{loading
							? "Saving..."
							: isEditing
								? "Save Changes"
								: "Add Member"}
					</SLButton>
				</div>
			</form>
		</div>
	);
}