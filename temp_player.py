import player


class TempPlayer(player.Player):

    def set_cards(self, card_list, deck):
        """
        Adds list of cards to player object but doesn't send them to block cards. This
            allows for other functions to still evaluate without getting the blocked card
            error

        card_list MUST contain non-blocked cards

        :param card_list: List of strings that represent player's cards
        :param deck: Adds cards to blocked card list
        :return: updated self.cards
        self.cards = card_list is also an easy implementation
        """
        for card in card_list:
            self.cards.append(card)

