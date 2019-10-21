import { get, post } from "./fetch";
import * as API from "../constants/api";

const mockWorkspaces = {
	requiredTransferWorkspaces: [
		{
			spaceId: "workspace1",
			displayName: "Lightning strike",
			transferableMembers: [
				{
					_id: "user2",
					name: "Ryan Lynch"
				},
				{
					_id: "user3",
					name: "Riker Lynch"
				},
				{
					_id: "user4",
					name: "Rydel Lynch"
				}
			]
		},
		{
			spaceId: "workspace2",
			displayName: "Time machine",
			transferableMembers: [
				{
					_id: "user5",
					name: "Edward Bayer",
					workspaceId: "workspace3"
				},
				{
					_id: "user6",
					name: "Eli Brook",
					workspaceId: "workspace3"
				}
			]
		}
	],
	deleteWorkspaces: [
		{
			spaceId: "workspace3",
			displayName: "Moon landing"
		}
	]
};

const ownershipToCheck = {
	workspaceId: "workspace1",
	fromUserId: "user1",
	toUserId: "user6"
};
describe("testing api", () => {
	beforeEach(() => {
		fetch.resetMocks();
	});

	it("calls get(API.WORKSPACES) and returns list of workspaces to transfer/delete", () => {
		fetch.mockResponseOnce(JSON.stringify({ ...mockWorkspaces }));

		//assert on the response
		get(`${API.WORKSPACES}?userId=user_1`).then(res => {
			expect(res).toEqual(mockWorkspaces);
		});

		//assert on the times called and arguments given to fetch
		expect(fetch.mock.calls.length).toEqual(1);
		expect(fetch.mock.calls[0][0]).toEqual(
			`${API.WORKSPACES}?userId=user_1`
		);
	});

	it("callspost(API.CHECK_OWNERSHIP) and returns answer if ownership transfer is cleared", () => {
		fetch.mockResponseOnce('OK', { status: 200, headers: { 'content-type': 'application/json' } });

		//assert on the response
		post(API.CHECK_OWNERSHIP, ownershipToCheck).then(res => {
			expect(res.status).toEqual(200);
        })

		//assert on the times called and arguments given to fetch
		expect(fetch.mock.calls.length).toEqual(1);
		expect(fetch.mock.calls[0][0]).toEqual(API.CHECK_OWNERSHIP);
	});
});
