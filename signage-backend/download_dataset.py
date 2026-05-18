from roboflow import Roboflow

# Snippet yang kamu titip tadi
rf = Roboflow(api_key="G6UFN9BLD7OcHn36irMG")
project = rf.workspace("tumbuh").project("1850_3_resplit-wcqni")
version = project.version(1)
dataset = version.download("yolov8")