package com.gplsp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TemplateSelectionRequest {
    private String documentTypeCode;
    private Integer templateId;
}
