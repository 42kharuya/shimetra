-- AddTable: waitlist_entries
CREATE TABLE "waitlist_entries" (
    "id"               UUID         NOT NULL DEFAULT gen_random_uuid(),
    "email"            TEXT         NOT NULL,
    "graduation_year"  INTEGER      NOT NULL,
    "concerns"         TEXT,
    "hearing_opt_in"   BOOLEAN,
    "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- AddUniqueIndex: email
CREATE UNIQUE INDEX "waitlist_entries_email_key" ON "waitlist_entries"("email");
