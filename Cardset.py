import random
import numpy as np
import math
import player


class Cardset:
    """
    A class that represents a deck of cards
    """

    def __init__(self, set_comm=[]):
        self.deck = ("As", "Ac", "Ad", "Ah",
                     "Ks", "Kc", "Kd", "Kh",
                     "Qs", "Qc", "Qd", "Qh",
                     "Js", "Jc", "Jd", "Jh",
                     "Ts", "Tc", "Td", "Th",
                     "9s", "9c", "9d", "9h",
                     "8s", "8c", "8d", "8h",
                     "7s", "7c", "7d", "7h",
                     "6s", "6c", "6d", "6h",
                     "5s", "5c", "5d", "5h",
                     "4s", "4c", "4d", "4h",
                     "3s", "3c", "3d", "3h",
                     "2s", "2c", "2d", "2h",
                     )
        self.blocked_cards = []
        for card in set_comm:
            if type(card) != type(""):
                raise ValueError("{a} was not a string".format(a=card))
            if card not in self.deck:
                raise ValueError("{a} is not a valid card".format(a=card))
        self.community_cards = set_comm

    def add_block(self, card_list):
        """
        Sets the blocked cards list
        :param card_list: list of strings where each string represents a card
        :return: updates the blocked cards list
        """
        for card in card_list:
            if isinstance(card, str):
                if card not in self.blocked_cards:
                    if card in self.deck:
                        self.blocked_cards.append(card)
                    else:
                        raise ValueError("{a} is an invalid card reference".format(a=card))
            else:
                raise ValueError("A card entered in the list isn't a str")

    def clear_block(self):
        """
        Clears the Blocked Cards List
        :return: none
        """
        self.blocked_cards = []

    def clear_all(self):
        """
        Clears community cards and Blocked Cards
        """
        self.community_cards = []
        self.blocked_cards = []

    def clear_last(self):
        """
           NOT IMPLEMENTED
                Clears last community cards and its corresponding Blocked Card
        """

    def clear_com_cards(self):
        """
        Clears community cards only
        """
        self.community_cards = []

    def deal_hand(self, player, pineapple=False):
        """
        Simulates giving a player a pineapple poker hand and puts said cards in
        the blockedCards list

        :return: update player cards
        """
        population = []  # Used for random sampled

        for card in self.deck:
            if card not in self.blocked_cards:
                population.append(card)  # Adds Cards that are not blocked
        if pineapple:
            final = random.sample(population, 3)
        else:
            final = random.sample(population, 2)
        player.set_cards(final)
        self.add_block(final)

    def set_community_cards(self, card_list):
        for card in card_list:
            if card in self.blocked_cards:
                raise Exception("{a} is in the blocked cards".format(a=card))
        self.community_cards = card_list

    def add_community_cards(self, card_list):
        for card in card_list:
            if card in self.blocked_cards:
                raise Exception("{a} is in the blocked cards".format(a=card))
            self.community_cards.append(card)

    def sim_full_comm(self):
        """
        :return: Updates community cards for all 5 cards
        """

        population = []
        for card in self.deck:
            if card in self.blocked_cards:
                continue
            else:
                population.append(card)

        new_five = random.sample(population, 5)
        self.set_community_cards(new_five)
        self.add_block(new_five)

    def sim_river(self):
        population = []
        for card in self.deck:
            if card in self.blocked_cards:
                continue
            else:
                population.append(card)

        new_one = random.sample(population, 1)
        self.set_community_cards(new_one)
        self.add_block(new_one)


if __name__ == "__main__":
    bot = player.Player(["Qh", "Jd"])
