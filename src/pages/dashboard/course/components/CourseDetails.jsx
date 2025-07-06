import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookUp, FileUp, Folder, Plus } from "lucide-react";
import { useState } from "react";
import AllClasses from "../class/AllChapter";
import CourseSetting from "../../components/forms/course/CourseSetting";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AddNewClass from "../../components/forms/class/AddNewClass";
import AddNewChaptar from "../../components/forms/chaptar/AddNewChaptar";
import AddSubject from "../../components/forms/subject/AddSubject";
import { useParams } from "react-router-dom";
import Loading from "@/components/global/Loading";
import useCourseDetails from "@/hooks/useCourseDetails";
import CustomMetaTag from "@/components/global/CustomMetaTags";

const CourseDetails = () => {
  const { courseId } = useParams();
  const [courseDetails, courseDetailsRefetch, isCourseDetailsLoading] =
    useCourseDetails({ courseId });

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  const handleChapterModalClose = () => setIsChapterModalOpen(false);
  const handleSubjectModalClose = () => setIsSubjectModalOpen(false);
  const handleClassModalClose = () => setIsClassModalOpen(false);

  return (
    <>
      <CustomMetaTag title={"Course Setting"} />
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-xl font-medium mb-2 md:mb-0">
            {courseDetails?.name}
          </h1>

          {/* dialog for class add */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size={"sm"} className={"rounded-3xl"}>
                Create New Class
                <Plus className="ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[65%] md:min-w-[45%] max-h-screen overflow-auto  bg-transparent border-none shadow-none flex items-center justify-center">
              <div className="flex gap-3 items-center justify-center flex-wrap">
                {/* card 1  for upload class */}
                <div className="bg-white dark:bg-gray-900 p-4 text-center flex flex-col items-center space-y-4 rounded-md">
                  <span className="bg-gray-100 p-3 rounded-full">
                    <FileUp className="text-purple-700" />
                  </span>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Upload your class
                  </p>
                  <div>
                    {/* Dialog for class link add */}
                    <Dialog
                      open={isClassModalOpen}
                      onOpenChange={setIsClassModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant={"link"} size={"sm"}>
                          <p className="text-sm text-purple-700 font-semibold">
                            Upload Class
                          </p>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="min-w-[45%] max-h-screen overflow-auto ">
                        {/* form component */}
                        <AddNewClass
                          refetch={courseDetailsRefetch}
                          onClose={handleClassModalClose}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {/* card 2  for chapter*/}
                <div className="bg-white dark:bg-gray-900 p-4 text-center flex flex-col items-center space-y-4 rounded-md">
                  <span className="bg-gray-100 p-3 rounded-full">
                    <Folder className="text-purple-700" />
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create new chapter
                  </p>

                  {/* Dialog for chapter add */}
                  <Dialog
                    open={isChapterModalOpen}
                    onOpenChange={setIsChapterModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant={"link"} size={"sm"}>
                        <p className="text-sm text-purple-700 font-semibold">
                          Create Chapter
                        </p>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-screen overflow-auto">
                      <AddNewChaptar
                        refetch={courseDetailsRefetch}
                        onClose={handleChapterModalClose}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* card 3  for subject add */}

                <div className="bg-white dark:bg-gray-900 p-4 text-center flex flex-col items-center space-y-4 rounded-md">
                  <span className="bg-gray-100 p-3 rounded-full">
                    <BookUp className="text-purple-700" />
                  </span>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Upload your subject
                  </p>
                  <div>
                    {/* Dialog for subject add */}
                    <Dialog
                      open={isSubjectModalOpen}
                      onOpenChange={setIsSubjectModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant={"link"} size={"sm"}>
                          <p className="text-sm text-purple-700 font-semibold">
                            Create Subject
                          </p>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className=" max-h-screen overflow-auto ">
                        {/* form component */}

                        <AddSubject
                          refetch={courseDetailsRefetch}
                          onClose={handleSubjectModalClose}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* class management tabs */}
        <div className="   mt-4 ">
          <Tabs defaultValue="classes">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="classes" className="  px-3 py-1.5">
                All Chapter
              </TabsTrigger>
              <TabsTrigger value="setting" className="  px-3 py-1.5">
                Course Setting
              </TabsTrigger>
            </TabsList>

            {isCourseDetailsLoading ? (
              <Loading />
            ) : (
              <div>
                {/* All classes */}
                <TabsContent value="classes">
                  <div className="mt-7">
                    <AllClasses
                      refetch={courseDetailsRefetch}
                      item={courseDetails}
                    />
                  </div>
                </TabsContent>
                {/* Course setting */}
                <TabsContent value="setting">
                  <div className="mt-7">
                    <CourseSetting></CourseSetting>
                  </div>
                </TabsContent>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CourseDetails;
