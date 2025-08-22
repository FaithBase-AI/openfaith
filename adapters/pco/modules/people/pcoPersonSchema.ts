import {
	mkPcoEntity,
	mkPcoWebhookDelivery,
} from "@openfaith/pco/modules/pcoBaseSchema";
import { pcoToOf } from "@openfaith/pco/transformer/pcoTransformer";
import {
	BasePerson,
	Campus,
	OfCustomField,
	OfEntity,
	OfFieldName,
	OfIdentifier,
	OfTransformer,
	Person,
} from "@openfaith/schema";
import { Schema } from "effect";

export const PcoPersonAttributes = Schema.Struct({
	accounting_administrator: Schema.Boolean.annotations({
		[OfFieldName]: "accountingAdministrator",
		[OfCustomField]: true,
	}),
	anniversary: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "anniversary",
	}),
	avatar: Schema.String.annotations({
		[OfFieldName]: "avatar",
	}),
	birthdate: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "birthdate",
	}),
	child: Schema.Boolean.annotations({
		[OfFieldName]: "child",
		[OfCustomField]: true,
	}),
	created_at: Schema.String.annotations({
		[OfFieldName]: "createdAt",
	}),
	demographic_avatar_url: Schema.String.annotations({
		[OfFieldName]: "demographicAvatarUrl",
		[OfCustomField]: true,
	}),
	first_name: Schema.String.pipe(Schema.minLength(1)).annotations({
		[OfFieldName]: "firstName",
	}),
	gender: Schema.NullOr(Schema.Literal("Male", "Female", "M", "F")).annotations(
		{
			[OfFieldName]: "gender",
		},
	),
	given_name: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "givenName",
		[OfCustomField]: true,
	}),
	grade: Schema.NullOr(
		Schema.Literal(-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
	).annotations({
		[OfFieldName]: "grade",
		[OfCustomField]: true,
	}),
	graduation_year: Schema.NullOr(Schema.Number).annotations({
		[OfFieldName]: "graduationYear",
		[OfCustomField]: true,
	}),
	inactivated_at: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "inactivatedAt",
	}),
	last_name: Schema.String.pipe(Schema.minLength(1)).annotations({
		[OfFieldName]: "lastName",
	}),
	medical_notes: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "medicalNotes",
		[OfCustomField]: true,
	}),
	membership: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "membership",
	}),
	middle_name: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "middleName",
	}),
	name: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "name",
	}),
	nickname: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "nickname",
		[OfCustomField]: true,
	}),
	passed_background_check: Schema.Boolean.annotations({
		[OfFieldName]: "passedBackgroundCheck",
		[OfCustomField]: true,
	}),
	people_permissions: Schema.NullOr(
		Schema.Union(Schema.Literal("Manager", "Editor"), Schema.String),
	).annotations({
		[OfFieldName]: "peoplePermissions",
		[OfCustomField]: true,
	}),
	remote_id: Schema.NullOr(
		Schema.Union(Schema.String, Schema.Number),
	).annotations({
		[OfFieldName]: "remoteId",
		[OfCustomField]: true,
	}),
	school_type: Schema.NullOr(Schema.String).annotations({
		[OfFieldName]: "schoolType",
		[OfCustomField]: true,
	}),
	site_administrator: Schema.Boolean.annotations({
		[OfFieldName]: "siteAdministrator",
		[OfCustomField]: true,
	}),
	status: Schema.Literal("active", "inactive").annotations({
		[OfFieldName]: "status",
	}),
	updated_at: Schema.String.annotations({
		[OfFieldName]: "updatedAt",
	}),
});
export type PcoPersonAttributes = typeof PcoPersonAttributes.Type;

export const pcoPersonTransformer = pcoToOf(
	PcoPersonAttributes,
	BasePerson,
	"person",
);

export const PcoPerson = mkPcoEntity({
	attributes: PcoPersonAttributes,
	links: Schema.Struct({
		addresses: Schema.optional(Schema.NullOr(Schema.String)),
		apps: Schema.optional(Schema.NullOr(Schema.String)),
		connected_people: Schema.optional(Schema.NullOr(Schema.String)),
		emails: Schema.optional(Schema.NullOr(Schema.String)),
		field_data: Schema.optional(Schema.NullOr(Schema.String)),
		household_memberships: Schema.optional(Schema.NullOr(Schema.String)),
		households: Schema.optional(Schema.NullOr(Schema.String)),
		html: Schema.String,
		inactive_reason: Schema.optional(Schema.NullOr(Schema.String)),
		message_groups: Schema.optional(Schema.NullOr(Schema.String)),
		messages: Schema.optional(Schema.NullOr(Schema.String)),
		notes: Schema.optional(Schema.NullOr(Schema.String)),
		organization: Schema.optional(Schema.NullOr(Schema.String)),
		person_apps: Schema.optional(Schema.NullOr(Schema.String)),
		phone_numbers: Schema.optional(Schema.NullOr(Schema.String)),
		platform_notifications: Schema.optional(Schema.NullOr(Schema.String)),
		self: Schema.String,
		social_profiles: Schema.optional(Schema.NullOr(Schema.String)),
		workflow_cards: Schema.optional(Schema.NullOr(Schema.String)),
	}),
	relationships: Schema.Struct({
		primary_campus: Schema.Struct({
			data: Schema.NullOr(
				Schema.Struct({
					id: Schema.String,
					type: Schema.Literal("PrimaryCampus"),
				}),
			),
		}).annotations({
			[OfEntity]: Campus,
		}),
	}),
	type: "Person",
}).annotations({
	[OfEntity]: Person,
	[OfIdentifier]: "pco-person",
	[OfTransformer]: pcoPersonTransformer,
});
export type PcoPerson = typeof PcoPerson.Type;

// Helper function to retrieve the transformer from any schema
export const getTransformer = <A, I, R>(
	schema: Schema.Schema<A, I, R>,
): Option.Option<typeof pcoPersonTransformer> =>
	SchemaAST.getAnnotation<typeof pcoPersonTransformer>(OfTransformer)(
		schema.ast,
	);

// Convenience function specifically for PcoPerson
export const getPcoPersonTransformer = () => getTransformer(PcoPerson);

export class PcoPersonCreatedWebhook extends Schema.Class<PcoPersonCreatedWebhook>(
	"PcoPersonCreatedWebhook",
)(mkPcoWebhookDelivery("people.v2.events.person.created", PcoPerson)) {}

export class PcoPersonUpdatedWebhook extends Schema.Class<PcoPersonUpdatedWebhook>(
	"PcoPersonUpdatedWebhook",
)(mkPcoWebhookDelivery("people.v2.events.person.updated", PcoPerson)) {}

export class PcoPersonDestroyedWebhook extends Schema.Class<PcoPersonDestroyedWebhook>(
	"PcoPersonDestroyedWebhook",
)(
	mkPcoWebhookDelivery(
		"people.v2.events.person.destroyed",
		Schema.Struct({
			// Destroyed events typically have minimal or no attributes
			attributes: Schema.optional(Schema.Unknown),
			id: Schema.String,
			links: Schema.optional(Schema.Unknown),
			relationships: Schema.optional(Schema.Unknown),
			type: Schema.Literal("Person"),
		}),
	),
) {}

export class PcoPersonMergerWebhook extends Schema.Class<PcoPersonMergerWebhook>(
	"PcoPersonMergerWebhook",
)(
	mkPcoWebhookDelivery(
		"people.v2.events.person_merger.created",
		Schema.Struct({
			attributes: Schema.optional(Schema.Unknown),
			id: Schema.String,
			links: Schema.optional(Schema.Unknown),
			relationships: Schema.Struct({
				person_to_keep: Schema.Struct({
					data: Schema.Struct({
						id: Schema.String,
						type: Schema.Literal("Person"),
					}),
				}),
				person_to_remove: Schema.Struct({
					data: Schema.Struct({
						id: Schema.String,
						type: Schema.Literal("Person"),
					}),
				}),
			}),
			type: Schema.Literal("PersonMerger"),
		}),
	),
) {}
