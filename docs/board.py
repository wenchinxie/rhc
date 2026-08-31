"""Loop and tools are both plugins. Model picks a name; loop looks it up."""

from __future__ import annotations

from collections.abc import Callable


class Board:
    def __init__(self) -> None:
        self.items: dict[str, str] = {}

    def hang(self, key: str, value: str) -> Callable[[], None]:
        if key in self.items:
            raise ValueError(f"already hung: {key}")
        self.items[key] = value

        def undo() -> None:
            self.items.pop(key, None)

        return undo

    def use(self, name: str) -> str:
        if name not in self.items:
            raise KeyError(f"not on the board: {name}")
        return self.items[name]


class Plugin:
    def __init__(self, board: Board, name: str, inject: list[str]) -> None:
        self.board = board
        self.name = name
        self.inject = inject
        self.undos: list[Callable[[], None]] = []

    def ready(self) -> bool:
        return all(key in self.board.items for key in self.inject)

    def hang(self, key: str, value: str) -> None:
        self.undos.append(self.board.hang(key, value))

    def unload(self) -> None:
        while self.undos:
            self.undos.pop()()


# Profile: what this process mounts. Not the model, not the loop body.
MOUNT = ["github"]

OFFER = {
    "github": [("mcp__github__create_issue", "opened issue")],
    "slack": [("mcp__slack__post", "posted")],
}


def search_tool(board: Board, query: str) -> list[str]:
    return [name for name in board.items if query in name]


def loop_step(board: Board, model_choice: str) -> str:
    """Agent loop. It does not mention github. It executes the name the model sent."""
    return board.use(model_choice)


def main() -> None:
    board = Board()

    tools = Plugin(board, "tools", inject=[])
    tools.hang("search_tool", "search")
    tools.hang("use_tool", "dispatch")

    loop = Plugin(board, "loop", inject=["search_tool", "use_tool"])
    print("loop ready?", loop.ready())

    for name in MOUNT:
        plugin = Plugin(board, name, inject=["use_tool"])
        for key, value in OFFER[name]:
            plugin.hang(key, value)

    print("MOUNT", MOUNT)
    print("board", list(board.items))

    # This step the model asked for github. Loop only sees a string.
    choice = "mcp__github__create_issue"
    print("model choice", choice)
    print("loop_step", loop_step(board, choice))

    # Next step the model asked for slack. Slack is not mounted.
    choice = "mcp__slack__post"
    print("model choice", choice)
    try:
        loop_step(board, choice)
    except KeyError as exc:
        print("loop_step", exc)


if __name__ == "__main__":
    main()
