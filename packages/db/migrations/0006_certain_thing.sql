CREATE TABLE "openfaith_adapterTokens" (
	"_tag" char(12) DEFAULT 'adapterToken' NOT NULL,
	"accessToken" text NOT NULL,
	"adapter" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"expiresIn" integer NOT NULL,
	"orgId" varchar(128) NOT NULL,
	"refreshToken" text NOT NULL,
	"userId" varchar(128) NOT NULL,
	CONSTRAINT "adapterTokensId" PRIMARY KEY("userId","orgId","adapter")
);
