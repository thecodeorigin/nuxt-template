-- Grant billing:manage + billing:read to org admins (identified by user:manage)
UPDATE organization_members
SET abilities = json_insert(
  json_insert(abilities, '$[#]', 'billing:read'),
  '$[#]', 'billing:manage'
)
WHERE json_type(abilities) = 'array'
  AND abilities LIKE '%user:manage%'
  AND abilities NOT LIKE '%billing:manage%';
--> statement-breakpoint
-- Grant billing:read to regular members (identified by project:read/write, not already billing-capable)
UPDATE organization_members
SET abilities = json_insert(abilities, '$[#]', 'billing:read')
WHERE json_type(abilities) = 'array'
  AND (abilities LIKE '%project:read%' OR abilities LIKE '%project:write%')
  AND abilities NOT LIKE '%billing:read%'
  AND abilities NOT LIKE '%billing:manage%';
