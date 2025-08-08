
class Player:

    def __init__(self, card_list=[]):
        self.cards = []
        # self.hand = ""  # Number corresponds with Hand Strength


    def set_cards(self, card_list, deck):
        """
        :param card_list: List of strings that represent player's cards
        :param deck: Adds cards to blocked card list
        :return: updated self.cards
        self.cards = card_list is also an easy implementation
        """

        temp = []
        for card in card_list:
            if card in deck.blocked_cards:
                raise Exception("Card in list is in the blocked card set")
            self.cards.append(card)
            temp.append(card)

        deck.add_block(temp)

    def get_cards(self):
        return self.cards

    def clear_cards(self):
        self.cards = []

    def deal_pin(self, Cardset):
        Cardset.deal_pineapple_hand(self)
