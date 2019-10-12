import PropTypes from "prop-types";
import React from "react";

export const WorkspaceGroupRows = ({
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
	groupTitle: PropTypes.string,
	workspaces: PropTypes.array.isRequired,
	children: PropTypes.node,
	shouldDisplay: PropTypes.bool
};

export const TransferOwnerView = ({loading, children, disabledNextPage, onClickNext}) => {
	const renderLoading = () => <div>Loading...</div>;
	return (
		<div>
			<h1>Transfer ownership</h1>
			<p>
				Before you leaving, it is required to transfer your tasks,
				projects and workspace admin rights to other person.
			</p>
			{loading ? renderLoading() : children}
			<button disabled={disabledNextPage} onClick={onClickNext}>
				Next
			</button>
		</div>
	);
};

TransferOwnerView.propTypes = {
	onToggleShowModal: PropTypes.func,
	onClickNext: PropTypes.func,
	children: PropTypes.node.isRequired,
	loading: PropTypes.bool,
	disabledNextPage: PropTypes.bool
};

export default TransferOwnerView;
