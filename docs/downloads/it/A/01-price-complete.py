def calculate_total(unit_price, quantity):
    if type(unit_price) is not int or unit_price < 0:
        raise ValueError("단가는 0 이상의 정수입니다.")
    if type(quantity) is not int or quantity <= 0:
        raise ValueError("수량은 1 이상의 정수입니다.")
    return unit_price * quantity


def main():
    try:
        unit_price = int(input("단가(원): "))
        quantity = int(input("수량: "))
        amount = calculate_total(unit_price, quantity)
        print("판매 금액:", amount, "원")
    except ValueError as error:
        print("입력을 확인하세요:", error)


if __name__ == "__main__":
    main()
