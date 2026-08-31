"""MCP tools hang at connect. search_tool only reads the catalog."""

from __future__ import annotations

from collections.abc import Callable


class Board:
    def __init__(self) -> None:
        self.items: dict[str, Callable[[object], str]] = {}
        self.undos: list[Callable[[], None]] = []

    def hang(self, key: str, run: Callable[[object], str]) -> None:
        if key in self.items:
            raise ValueError(f"already hung: {key}")
        self.items[key] = run

        def undo() -> None:
            self.items.pop(key, None)

        self.undos.append(undo)

    def keys(self) -> list[str]:
        return list(self.items)


def connect_github(board: Board) -> None:
    board.hang("mcp__github__create_issue", lambda args: f"opened {args}")
    board.hang("mcp__github__list_prs", lambda args: f"prs {args}")


def connect_linear(board: Board) -> None:
    board.hang("mcp__linear__save_issue", lambda args: f"saved {args}")


CATALOG = {
    "mcp__github__create_issue": "Open a GitHub issue",
    "mcp__github__list_prs": "List pull requests",
    "mcp__linear__save_issue": "Save a Linear issue",
}

# What the model sees each turn. Does not grow when search hits.
MODEL_VISIBLE = ["search_tool", "use_tool", "bash"]


def search_tool(query: str) -> list[str]:
    hits = [name for name, desc in CATALOG.items() if query in name or query in desc]
    print(f"search_tool({query!r}) -> {hits}")
    print(f"  board still: {list(CATALOG)}")
    print(f"  model still sees: {MODEL_VISIBLE}")
    return hits


def use_tool(board: Board, name: str, args: object) -> str:
    if name not in board.items:
        raise KeyError(f"not on the board: {name}")
    result = board.items[name](args)
    print(f"use_tool({name}) -> {result}")
    return result


def main() -> None:
    board = Board()
    connect_github(board)
    connect_linear(board)
    print(f"after connect, board: {board.keys()}")
    print(f"model sees: {MODEL_VISIBLE}")
    print()

    print("search is a lookup, not a hang")
    search_tool("issue")
    print()

    print("call goes through use_tool to a tool already hung")
    use_tool(board, "mcp__linear__save_issue", {"title": "bug"})
    print(f"board after call: {board.keys()}")


if __name__ == "__main__":
    main()
