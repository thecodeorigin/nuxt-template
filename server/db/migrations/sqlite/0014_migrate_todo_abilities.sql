UPDATE organization_members
SET abilities = (
  SELECT json_group_array(DISTINCT mapped)
  FROM (
    SELECT
      CASE
        WHEN value = 'todo:manage'      THEN 'project:manage'
        WHEN value = 'todo:read'        THEN 'project:read'
        WHEN value = 'todo:write'       THEN 'project:write'
        WHEN value = 'todo:delete:self' THEN 'project:write'
        ELSE value
      END AS mapped
    FROM json_each(abilities)
  )
)
WHERE abilities LIKE '%todo:%';
