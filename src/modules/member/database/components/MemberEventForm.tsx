"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";

import {
	getMemberEventDefinition,
	MEMBER_EVENT_CONFIG,
} from "../config/member-event.config";

import type {
	MemberEventData,
	MemberEventFormValues,
} from "../types/member.types";

type MemberEventFormProps = {
	event?: MemberEventData | null;
	loading?: boolean;
	onSubmit: (
		values: MemberEventFormValues,
	) => Promise<void>;
	onCancel: () => void;
};

function getInitialData(
	event: MemberEventData | null | undefined,
): Record<string, string> {
	if (!event) {
		return {};
	}

	const data: Record<string, string> = {};

	Object.entries(event.data ?? {}).forEach(
		([key, value]) => {
			if (
				value !== null &&
				value !== undefined
			) {
				data[key] = String(value);
			}
		},
	);

	return data;
}

export default function MemberEventForm({
	event,
	loading = false,
	onSubmit,
	onCancel,
}: MemberEventFormProps) {
	const [eventType, setEventType] =
		useState<string>(
			event?.eventType ??
				MEMBER_EVENT_CONFIG[0]?.value ??
				"",
		);

	const [data, setData] = useState<
		Record<string, string>
	>(() => getInitialData(event));

	const [error, setError] = useState("");

	const isEditing = Boolean(event);

	const definition =
		getMemberEventDefinition(eventType);

	useEffect(() => {
		if (event) {
			setEventType(event.eventType);
			setData(getInitialData(event));
		} else {
			const firstEvent =
				MEMBER_EVENT_CONFIG[0];

			setEventType(
				firstEvent?.value ?? "",
			);
			setData({});
		}

		setError("");
	}, [event]);

	function handleFieldChange(
		key: string,
		value: string,
	) {
		setData((current) => ({
			...current,
			[key]: value,
		}));
	}

	function handleEventTypeChange(
		value: string,
	) {
		setEventType(value);
		setData({});
		setError("");
	}

	async function handleSubmit(
		formEvent: React.FormEvent<HTMLFormElement>,
	) {
		formEvent.preventDefault();

		setError("");

		if (!definition) {
			setError(
				"Invalid event type.",
			);
			return;
		}

		for (const field of definition.fields) {
			if (
				field.required &&
				!data[field.key]?.trim()
			) {
				setError(
					`${field.label} is required.`,
				);
				return;
			}
		}

		try {
			await onSubmit({
				eventType,
				data,
			});
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Failed to save event data.",
			);
		}
	}

	return (
		<div className="w-full">
			<div className="mb-5 flex items-start justify-between gap-4">
				<div>
					<h2 className="text-base font-bold text-[var(--sl-text)]">
						{isEditing
							? "Edit Event Data"
							: "Add Event Data"}
					</h2>

					<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
						Store event-specific information for this member.
					</p>
				</div>

				<button
					type="button"
					onClick={onCancel}
					disabled={loading}
					aria-label="Close"
					className="flex size-9 items-center justify-center rounded-xl text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)] disabled:opacity-50"
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
						htmlFor="event-type"
						className="text-xs font-bold text-[var(--sl-text)]"
					>
						Event
					</label>

					<select
						id="event-type"
						value={eventType}
						onChange={(event) =>
							handleEventTypeChange(
								event.target
									.value,
							)
						}
						disabled={
							loading || isEditing
						}
						className="h-10 w-full rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-3 text-xs text-[var(--sl-text)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{MEMBER_EVENT_CONFIG.map(
							(item) => (
								<option
									key={
										item.value
									}
									value={
										item.value
									}
								>
									{item.label}
								</option>
							),
						)}
					</select>

					{definition && (
						<p className="text-[10px] leading-4 text-[var(--sl-text-muted)]">
							{
								definition.description
							}
						</p>
					)}
				</div>

				{definition && (
					<div className="space-y-4">
						{definition.fields.map(
							(field) => (
								<div
									key={
										field.key
									}
									className="space-y-2"
								>
									<label
										htmlFor={`event-field-${field.key}`}
										className="text-xs font-bold text-[var(--sl-text)]"
									>
										{
											field.label
										}

										{field.required && (
											<span className="ml-1 text-red-400">
												*
											</span>
										)}
									</label>

									<SLInput
										id={`event-field-${field.key}`}
										type={
											field.type ===
											"number"
												? "number"
												: "text"
										}
										value={
											data[
												field.key
											] ??
											""
										}
										onChange={(
											event,
										) =>
											handleFieldChange(
												field.key,
												event
													.target
													.value,
											)
										}
										placeholder={
											field.placeholder
										}
										disabled={
											loading
										}
										inputMode={
											field.type ===
											"power"
												? "decimal"
												: undefined
										}
									/>
								</div>
							),
						)}
					</div>
				)}

				<p className="text-[10px] leading-4 text-[var(--sl-text-muted)]">
					For power fields, use values such as
					912M, 2.244B, or 8731000000.
				</p>

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
						disabled={
							loading ||
							!definition
						}
						className="min-w-28"
					>
						<Save className="mr-2 size-4" />

						{loading
							? "Saving..."
							: isEditing
								? "Save Changes"
								: "Add Event"}
					</SLButton>
				</div>
			</form>
		</div>
	);
}