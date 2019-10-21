import { string, array, node, bool } from "prop-types";
import React from "react";

const WorkspaceGroupRows = ({
	shouldDisplay,
	groupTitle,
	workspaces,
	children
}) =>
	!shouldDisplay ? null : (
		<div>
			<h3>{groupTitle}</h3>
			<div>
				{workspaces.map(workspace => (
					<div key={workspace.spaceId} style={{ marginTop: "1rem" }}>
						<span>Workspace: {workspace.displayName}</span>
						<span>
							{React.Children.count(children) === 0
								? null
								: React.cloneElement(children, { workspace })}
						</span>
					</div>
				))}
			</div>
		</div>
	);

WorkspaceGroupRows.propTypes = {
	groupTitle: string,
	workspaces: array.isRequired,
	children: node,
	shouldDisplay: bool
};

export default WorkspaceGroupRows;
