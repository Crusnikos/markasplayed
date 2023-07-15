import React, { useReducer, useState } from "react";
import { DispatchSnackbar } from "../../components/SnackbarDialog";
import { MaintenceState } from "../state";
import { ArticleFormData, FullArticleData } from "../../api/article";
import { Lookups } from "../../api/lookup";
import { ImageData } from "../../api/files";
import { makeStyles } from "tss-react/mui";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  Grid,
  Typography,
} from "@mui/material";
import i18next from "i18next";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown";
import ContentForm from "./Forms/Content";
import CoverImageForm from "./Forms/CoverImage";
import GalleryForm from "./Forms/Gallery";
import { useForm } from "react-hook-form";
import {
  createCoverData,
  createGalleryData,
  defaultFormValues,
} from "./utils/defaultFormValues";
import { useFirebaseAuth } from "../../context/FirebaseProvider";
import { useArticleData } from "../../context/ArticleListProvider";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import imagesReducer from "./utils/imagesReducer";
import submitForm from "./utils/submitForm";

type ContentSubPart = "article" | "cover" | "gallery";

const useStyles = makeStyles()((theme) => ({
  accordionSummary: {
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 2%, ${theme.palette.primary.light} 0%)`,
    color: theme.palette.common.white,
  },
  activeAccordionSummary: {
    background: `linear-gradient(90deg, ${theme.palette.info.main} 2%, ${theme.palette.info.light} 0%)`,
    color: theme.palette.common.white,
  },
  errorAccordionSummary: {
    background: `linear-gradient(90deg, ${theme.palette.error.main} 2%, ${theme.palette.error.light} 0%)`,
    color: theme.palette.common.white,
  },
  buttonSection: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
  },
  accordionIconRotated: {
    transform: "rotate(180deg)",
  },
  accordionDetails: {
    padding: theme.spacing(1),
  },
}));

function createSuccessMessage(
  id: number | null,
  addToGalleryFailedCalls: number,
  updateGalleryFailedCalls: number
): string {
  const message = i18next.t(
    `form.success.article.${id === null ? "add" : "update"}`
  );
  const submessage1 =
    addToGalleryFailedCalls > 0
      ? `;( ${addToGalleryFailedCalls} )${i18next.t(
          "form.warning.gallery.failedAdd"
        )}`
      : "";

  const submessage2 =
    updateGalleryFailedCalls > 0
      ? `;( ${updateGalleryFailedCalls} )${i18next.t(
          "form.warning.gallery.failedUpdate"
        )}`
      : "";

  return message + submessage1 + submessage2;
}

function createButtonText(
  authenticated: boolean | undefined,
  id: number | undefined
): string {
  if (authenticated && id) return i18next.t("form.submit.article.edit");
  if (authenticated && !id) return i18next.t("form.submit.article.save");
  return i18next.t("form.submit.notAvailable");
}

export default function Content(props: {
  data?: FullArticleData;
  images?: {
    main: ImageData | undefined;
    gallery: ImageData[] | undefined;
  };
  lookups: Lookups | undefined;
  setResponseOnSubmit: DispatchSnackbar;
  setLoadingProgressInfo: (element: string | undefined) => void;
  setSyncRequired?: (element: boolean) => void;
  setMaintence: (element: MaintenceState) => void;
  closeDialog: () => void;
}) {
  const { classes } = useStyles();
  const {
    data,
    images,
    lookups,
    setResponseOnSubmit,
    setLoadingProgressInfo,
    setSyncRequired,
    setMaintence,
    closeDialog,
  } = props;
  const [expanded, setExpanded] = useState<ContentSubPart | false>(false);
  const [contents] = useState<ContentSubPart[]>([
    "article",
    "cover",
    "gallery",
  ]);

  const { app, authenticated } = useFirebaseAuth();
  const [[, , page], getNextPage] = useArticleData();
  const navigate = useNavigate();

  const { handleSubmit, control, formState, watch, setValue } =
    useForm<ArticleFormData>({
      defaultValues: defaultFormValues({ data }),
      mode: "onChange",
    });
  const { isValid, submitCount } = formState;

  const [imagesState, imagesDispatch] = useReducer(imagesReducer, {
    coverImage: createCoverData(images),
    gallery: createGalleryData(images),
  });

  const handleAccordionChange =
    (panel: ContentSubPart) =>
    (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  function selectAccordionColorScheme(content: ContentSubPart): string {
    if (content === expanded) {
      return classes.activeAccordionSummary;
    }
    if (submitCount > 0 && content === "article" && !isValid) {
      return classes.errorAccordionSummary;
    }
    if (
      submitCount > 0 &&
      content === "cover" &&
      imagesState.coverImage.preview === undefined
    ) {
      return classes.errorAccordionSummary;
    }
    return classes.accordionSummary;
  }

  const selectForm = (content: ContentSubPart): JSX.Element => {
    switch (content) {
      case "article":
        return (
          <ContentForm
            control={control}
            lookups={lookups}
            formState={formState}
            watch={watch}
            setValue={setValue}
          />
        );
      case "cover":
        const coverImageError =
          submitCount > 0 && imagesState.coverImage.preview === undefined
            ? i18next.t("form.error.frontImage.notSelected")
            : undefined;

        return (
          <CoverImageForm
            coverData={imagesState.coverImage}
            imagesDispatch={imagesDispatch}
            error={coverImageError}
          />
        );
      default:
        const activeGallery = imagesState.gallery.filter(
          (i) => i.state !== "deactivated"
        );
        const numberOfDeactivatedImages =
          imagesState.gallery.length - activeGallery.length;

        return (
          <GalleryForm
            numberOfDeactivatedImages={numberOfDeactivatedImages}
            gallery={activeGallery}
            imagesDispatch={imagesDispatch}
          />
        );
    }
  };

  return (
    <React.Fragment>
      <form
        autoComplete="off"
        noValidate
        onSubmit={handleSubmit(async (formData, event) => {
          //Prevent default
          event?.preventDefault();

          //Check front image
          if (imagesState.coverImage.preview === undefined) return;

          //Generate transactionId
          const transactionId = uuidv4();

          //Submit
          const result = await submitForm(
            setResponseOnSubmit,
            formData,
            formData.articleType,
            imagesState,
            setMaintence,
            setLoadingProgressInfo,
            app,
            transactionId
          );

          //Handling result
          if (result.status === "success") {
            if (formData.id === null) await getNextPage({ page: 1 });
            else await getNextPage({ page });

            //Success
            setResponseOnSubmit({
              message: createSuccessMessage(
                formData.id,
                result.processingData?.addToGalleryFailedCalls!,
                result.processingData?.updateGalleryFailedCalls!
              ),
              severity: `success`,
            });
          }

          //Handling after submit
          if (formData.id === null) navigate("/");
          closeDialog();
          return setSyncRequired?.(true);
        })}
      >
        <FormControl fullWidth variant="outlined">
          {contents.map((content) => (
            <Accordion
              key={content}
              expanded={expanded === content}
              onChange={handleAccordionChange(content)}
            >
              <AccordionSummary className={selectAccordionColorScheme(content)}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography variant="body1" fontWeight="bold">
                      {i18next.t(`form.view.${content}`)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <ExpandCircleDownIcon
                      className={
                        expanded === content ? classes.accordionIconRotated : ""
                      }
                    />
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                {selectForm(content)}
              </AccordionDetails>
            </Accordion>
          ))}
          <Button
            type="submit"
            variant="contained"
            disabled={!authenticated}
            fullWidth
            className={classes.buttonSection}
          >
            {createButtonText(authenticated, data?.id)}
          </Button>
        </FormControl>
      </form>
    </React.Fragment>
  );
}
