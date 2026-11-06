package demo.campus.campusremarketmember.member.dto;

import demo.campus.campusremarketmember.member.entity.School;

/** 화면으로 보내는 학교 정보 (가입·로그인 화면의 학교 목록) */
public record SchoolView(Long id, String name, String region, String emailDomain) {

    public static SchoolView of(School s) {               // Entity → 화면용 모양으로 바꾸기
        return new SchoolView(s.getId(), s.getName(), s.getRegion(), s.getEmailDomain());
    }
}
