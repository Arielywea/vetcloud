# Task 2: Auto-update pet last_visit on clinical record create/update

**Status:** ✅ Complete

## Changes

### POST /items/clinical_records (line 574-578)
After inserting a new clinical record, added a query to auto-update the pet's `last_visit` field using `GREATEST(COALESCE(...))` to ensure it only moves forward in time.

```js
await pool.query(
  'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
  [r.date || new Date().toISOString(), r.pet_id]
);
```

### PATCH /items/clinical_records/:id (line 605-612)
After updating a clinical record, if the `date` field was changed, the pet's `last_visit` is updated to reflect the new date (with the same `GREATEST` guard).

```js
if (r.date) {
  const record = result.rows[0];
  await pool.query(
    'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
    [r.date, record.pet_id]
  );
}
```

## Commit
`5144549` — `feat: auto-update pet last_visit on clinical record create/update`
