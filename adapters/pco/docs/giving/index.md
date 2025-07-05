Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](index.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)

2019-10-18

Info

[Batch](vertices/batch.md)

[BatchGroup](vertices/batch_group.md)

[Campus](vertices/campus.md)

[Designation](vertices/designation.md)

[DesignationRefund](vertices/designation_refund.md)

[Donation](vertices/donation.md)

[Fund](vertices/fund.md)

[InKindDonation](vertices/in_kind_donation.md)

[Label](vertices/label.md)

[Note](vertices/note.md)

[Organization](vertices/organization.md)

[PaymentMethod](vertices/payment_method.md)

[PaymentSource](vertices/payment_source.md)

[Person](vertices/person.md)

[Pledge](vertices/pledge.md)

[PledgeCampaign](vertices/pledge_campaign.md)

[RecurringDonation](vertices/recurring_donation.md)

[RecurringDonationDesignation](vertices/recurring_donation_designation.md)

[Refund](vertices/refund.md)

[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# 2019-10-18

Asynchronously process Batch and BatchGroup commit and delete actions to better handle those with large numbers of donations.

# Changes

Type

Changes to

Notes

breaking

`batch`

Destroy is processed asynchronously, returns Batch with 'updating' status

breaking

`batch_group`

Destroy is processed asynchronously, returns BatchGroup with 'updating' status

breaking

`batch-commit`

Commit is processed asynchronously, returns Batch with 'updating' status

breaking

`batchgroup-commit`

Commit is processed asynchronously, returns BatchGroup with 'updating' status