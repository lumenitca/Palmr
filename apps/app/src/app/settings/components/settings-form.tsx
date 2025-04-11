import { SettingsFormProps, ValidGroup } from "../types";
import { SettingsGroup } from "./settings-group";

const GROUP_ORDER: ValidGroup[] = ["general", "email", "security", "storage"];

export function SettingsForm({
  groupedConfigs,
  collapsedGroups,
  groupForms,
  onGroupSubmit,
  onToggleCollapse,
}: SettingsFormProps) {
  const sortedGroups = Object.entries(groupedConfigs).sort(([a], [b]) => {
    const indexA = GROUP_ORDER.indexOf(a as ValidGroup);
    const indexB = GROUP_ORDER.indexOf(b as ValidGroup);

    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  return (
    <div className="flex flex-col gap-6">
      {sortedGroups.map(([group, configs]) => (
        <SettingsGroup
          key={group}
          configs={configs}
          form={groupForms[group as ValidGroup]}
          group={group}
          isCollapsed={collapsedGroups[group]}
          onSubmit={(data) => onGroupSubmit(group as ValidGroup, data)}
          onToggleCollapse={() => onToggleCollapse(group as ValidGroup)}
        />
      ))}
    </div>
  );
}
