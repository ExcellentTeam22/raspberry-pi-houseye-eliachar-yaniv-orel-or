import pandas as pd
import consts as C

pd.set_option('display.max_columns', None, 'display.max_rows', None)
df_users = pd.DataFrame(columns=[C.USERNAME, C.IMAGE_PATH, C.IMAGE])


def create_data_frame(df_path: str):
    """
    Get a path to the dataframe and return the dataframe.
    :param df_path: A path to the dataframe.
    :return: The dataframe.
    """
    pd.set_option('display.max_columns', None, 'display.max_rows', None)
    return pd.read_hdf(df_path)

#
# def create_data():
#     """
#     Create a dictionary which the key is name of the image (taken from the df) and the value is a tuple
#     of the full path image and the full path to the label image.
#     :return: Dictionary
#     """
#     df = create_data_frame(C.attention_results_h5)
#     my_dict = create_data_structure_images_names_paths(df)
#     return my_dict

