# import random
from player import Player
import evaluator as ev
from Cardset import Cardset
import time as t


def simulate_hand(player1, player2, deck, best_hand=False, num_cards=0, set_board=[]):
    """
    Simulates a hand for players with cards that remain the same
    :param set_board:
    :param num_cards:
    :param best_hand:
    :param player1:
    :param player2:
    :param deck: Cardset

    :return: Player1 Wins == 1       Player2 Wins == 2          Tie == 0
    """
    pin = False
    if (num_cards == 0):
        deck.clear_all()
        deck.add_block(player1.cards)
        deck.add_block(player2.cards)
        deck.sim_full_comm()
    elif (num_cards >= 1):  # Fixed: was checking == 4, but should handle any community cards
        deck.clear_all()
        deck.set_community_cards(set_board)
        deck.add_block(player1.cards)
        deck.add_block(player2.cards)
        # Only simulate remaining cards if not a full board
        if len(set_board) < 5:
            remaining_cards = 5 - len(set_board)
            for _ in range(remaining_cards):
                deck.sim_river()

    if len(player1.cards) == 3:
        pin = True

    # best string or best_string, best_combo
    p1 = evaluate_hand(player1, deck, pineapple=pin, best_hand=best_hand)
    p2 = evaluate_hand(player2, deck, pineapple=pin, best_hand=best_hand)
    if best_hand:
        string_int = ev.eval_decoder_comparison(p1[0], p2[0])  # indicates which hand won
        if string_int == 1:
            return string_int, p1[1]
        elif string_int == 2:
            return string_int, p2[1]
        else:
            return 0, [p1[1], p2[1]]

    return ev.eval_decoder_comparison(p1, p2)


def evaluate_hand(p1, deck, pineapple=False, best_hand=True):
    """
     Function to evaluate hand strength
    :param best_hand:
    :param p1:
    :param deck: deck
    :param pineapple: boolean to determine if pineapple or regular hand
    :return: String of best hand or string, card list
    """

    if pineapple:
        if best_hand:
            return ev.evaluator_pineapple(p1, deck, best_hand=True)
        return ev.evaluator_pineapple(p1, deck)
    else:
        return ev.eval_standard(p1, deck)


def estimate_equity(player1, player2, deck, num_simulations, best_hand=False, num_cards=0, set_board=[]):
    """
    Main function to estimate equity using Monte Carlo simulation

    :param best_hand: boolean that makes me return the best hands for each player
    :param hand: they want to know which hand was the best of three pineapple options
    :param deck: Cardset obj
    :param player1:  object
    :param player2: Player object
    :param num_simulations: High number of sims which should to a smaller confidence interval
    :return: Dictionary/List of equity values
    """
    player1_wins = 0
    player2_wins = 0
    ties = 0

    if best_hand:
        p1_01 = [player1.cards[0], player1.cards[1]]
        p1_02 = [player1.cards[0], player1.cards[2]]
        p1_12 = [player1.cards[1], player1.cards[2]]
        p1_combo_list = (p1_01, p1_02, p1_12)
        p2_01 = [player2.cards[0], player2.cards[1]]
        p2_02 = [player2.cards[0], player2.cards[2]]
        p2_12 = [player2.cards[1], player2.cards[2]]
        p2_combo_list = (p2_01, p2_02, p2_12)
        p1_wins_01 = 0
        p1_wins_02 = 0
        p1_wins_12 = 0

        p2_wins_01 = 0
        p2_wins_02 = 0
        p2_wins_12 = 0

        for _ in range(num_simulations):
            i = 0
            if (num_cards == 0):
                result = simulate_hand(player1, player2, deck, best_hand=True)
            elif (num_cards >= 1):  # Fixed: was checking == 4
                result = simulate_hand(player1, player2, deck, best_hand=True, num_cards=num_cards, set_board=set_board)
            if result[0] == 1:
                player1_wins += 1
                for card_combo in p1_combo_list:
                    if card_combo == result[1]:
                        if i == 0:
                            p1_wins_01 += 1
                        elif i == 1:
                            p1_wins_02 += 1
                        else:
                            p1_wins_12 += 1
                    i += 1
            elif result[0] == 2:
                player2_wins += 1
                for card_combo in p2_combo_list:
                    if card_combo == result[1]:
                        if i == 0:
                            p2_wins_01 += 1
                        elif i == 1:
                            p2_wins_02 += 1
                        else:
                            p2_wins_12 += 1
                    i += 1
            else:
                ties += 1

        player1_equity = player1_wins / num_simulations
        player2_equity = player2_wins / num_simulations
        draw_equity = ties / num_simulations
        p1_01_equity = p1_wins_01 / player1_wins if player1_wins > 0 else 0
        p1_02_equity = p1_wins_02 / player1_wins if player1_wins > 0 else 0
        p1_12_equity = p1_wins_12 / player1_wins if player1_wins > 0 else 0
        p1_combo_tup = (p1_01_equity, p1_02_equity, p1_12_equity)

        p2_01_equity = p2_wins_01 / player2_wins if player2_wins > 0 else 0
        p2_02_equity = p2_wins_02 / player2_wins if player2_wins > 0 else 0
        p2_12_equity = p2_wins_12 / player2_wins if player2_wins > 0 else 0
        p2_combo_tup = (p2_01_equity, p2_02_equity, p2_12_equity)

        return [player1_equity, player2_equity, draw_equity, p1_combo_list, p1_combo_tup, p2_combo_list, p2_combo_tup]

    else:
        for _ in range(num_simulations):
            if num_cards == 0:
                result = simulate_hand(player1, player2, deck)
            else:
                result = simulate_hand(player1, player2, deck, num_cards=num_cards, set_board=set_board)

            if result == 1:
                player1_wins += 1
            elif result == 2:
                player2_wins += 1
            else:
                ties += 1

        player1_equity = player1_wins / num_simulations
        player2_equity = player2_wins / num_simulations
        draw_equity = ties / num_simulations

        return [player1_equity, player2_equity, draw_equity]

# Remove problematic main block completely - not needed for web deployment