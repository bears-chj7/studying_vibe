def print_tree(height, trunk_width=3, trunk_height=2):
    # Leaves
    for i in range(height):
        spaces = ' ' * (height - i - 1)
        stars = '^' * (2 * i + 1)
        print(f"{spaces}{stars}")
    
    # Trunk
    # Trunk dimensions are now parameters
    trunk_space = ' ' * (height - (trunk_width // 2) - 1)
    for _ in range(trunk_height):
        print(f"{trunk_space}{'|' * trunk_width}")

if __name__ == "__main__":
    print_tree(5)
